import { loadStoredData, saveStoredData } from "./offlineStorage";

export type PortfolioKind = "projectos" | "eventos" | "obras" | "certificados" | "instituicoes";
export type PortfolioAttachment = { url: string; name: string; mime: string; type: "office" | "video" };
export type PortfolioItem = { id: string; kind: PortfolioKind; title: string; description: string; category?: string; image?: string; pdf?: string; attachment?: PortfolioAttachment; externalUrl?: string; updatedAt: number };

export type GitHubInventoryFile = { name: string; path: string; sha: string; size: number; type: "file" | "dir"; url: string };
export type GitHubSession = { repository: string; branch: string; canWrite: boolean; permissions: { metadata?: string; contents?: string } };
export type GitHubTextFile = { path: string; sha: string; content: string; size: number };

const REPOSITORY = "Joselio-joao/Jos-lio-portofolio-";
const BRANCH = "main";
const CONTENT_PATH = "client/public/data/portfolio-content.json";
const UPLOADS_DIRECTORY = "client/public/uploads";
const PUBLIC_CONTENT_URL = "/Jos-lio-portofolio-/data/portfolio-content.json";

function publicContentUrl(): string {
  return `${PUBLIC_CONTENT_URL}?v=${Date.now()}`;
}
const PUBLIC_UPLOADS_URL = "/Jos-lio-portofolio-/uploads";
const PORTFOLIO_CACHE_KEY = "portfolio-content-cache-v1";
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const BLOCKED_PATH_PARTS = ["..", ".git", ".env", "credentials", "secrets"];
const ALLOWED_TEXT_EXTENSIONS = [".html", ".css", ".js", ".json", ".md", ".txt", ".xml", ".svg", ".webmanifest"];

type GitHubFile = { sha: string; size?: number; content?: string; encoding?: string; name?: string; path?: string; type?: "file" | "dir"; html_url?: string; download_url?: string };
type AssetKind = "image" | "pdf" | "attachment";
type AssetDescriptor = { content: string; extension: string; mime: string; type?: "office" | "video" };

const OFFICE_MIME: Record<string, string> = {
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};
const VIDEO_MIME: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "video/ogg": "ogv" };

export function validateExternalUrl(value: string | undefined): string | undefined {
  const url = value?.trim();
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
    return parsed.toString();
  } catch {
    throw new Error("A ligação externa deve começar por https:// ou http://.");
  }
}

export function normalizePortfolioItem(input: Pick<PortfolioItem, "kind" | "title" | "description"> & Partial<PortfolioItem>): PortfolioItem {
  return {
    id: input.id ?? crypto.randomUUID(),
    kind: input.kind,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category?.trim() || undefined,
    image: input.image,
    pdf: input.pdf,
    attachment: input.attachment,
    externalUrl: validateExternalUrl(input.externalUrl),
    updatedAt: input.updatedAt ?? Date.now(),
  };
}

async function refreshPortfolioContent(): Promise<PortfolioItem[] | null> {
  try {
    const response = await fetch(publicContentUrl(), { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Conteúdos públicos indisponíveis (${response.status}).`);
    const payload: unknown = await response.json();
    const items = Array.isArray(payload) ? payload as PortfolioItem[] : [];
    await saveStoredData(PORTFOLIO_CACHE_KEY, items).catch(() => undefined);
    return items;
  } catch {
    return null;
  }
}

export async function loadPortfolioContent(): Promise<PortfolioItem[]> {
  const fresh = await refreshPortfolioContent();
  if (fresh !== null) return fresh;
  return (await loadStoredData<PortfolioItem[] | null>(PORTFOLIO_CACHE_KEY, null)) ?? [];
}

function encodeContent(value: string): string { return btoa(unescape(encodeURIComponent(value))); }
function decodeContent(value: string): string { return decodeURIComponent(escape(atob(value.replace(/\n/g, "")))); }
function githubHeaders(token: string): HeadersInit { return { Authorization: `Bearer ${token.trim()}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }; }
function githubEndpoint(path: string): string { return `https://api.github.com/repos/${REPOSITORY}/contents/${path.split("/").map(encodeURIComponent).join("/")}`; }
function githubRepoEndpoint(path = ""): string { return `https://api.github.com/repos/${REPOSITORY}${path}`; }

async function githubError(response: Response, fallback: string): Promise<Error> {
  if (response.status === 401) return new Error("O token GitHub é inválido ou expirou.");
  if (response.status === 403) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    return new Error(remaining === "0" ? "O limite temporário da API GitHub foi atingido. Tente novamente mais tarde." : "O token foi aceite, mas não tem a permissão necessária.");
  }
  if (response.status === 404) return new Error("O repositório, branch ou ficheiro não foi encontrado. Confirme a configuração.");
  if (response.status === 409) return new Error("O ficheiro remoto mudou. Recarregue-o antes de publicar para evitar sobrescrever alterações.");
  if (response.status >= 500) return new Error("O GitHub está temporariamente indisponível. Tente novamente mais tarde.");
  try {
    const payload = await response.json() as { message?: string };
    return new Error(payload.message ? `${fallback}: ${payload.message}` : fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function verifyGitHubAccess(token: string): Promise<GitHubSession> {
  if (!token.trim()) throw new Error("Introduza um token GitHub para iniciar a sessão.");
  const repositoryResponse = await fetch(githubRepoEndpoint(), { headers: githubHeaders(token) });
  if (!repositoryResponse.ok) throw await githubError(repositoryResponse, "O token não tem acesso ao repositório configurado.");
  const repository = await repositoryResponse.json() as { default_branch?: string; permissions?: { pull?: boolean; push?: boolean }; name?: string; full_name?: string };
  const branchResponse = await fetch(githubRepoEndpoint(`/branches/${encodeURIComponent(BRANCH)}`), { headers: githubHeaders(token) });
  if (!branchResponse.ok) throw new Error("A branch configurada não foi encontrada.");
  const canWrite = Boolean(repository.permissions?.push);
  if (!canWrite) throw new Error("O token foi aceite, mas não tem permissão de escrita.");
  return { repository: repository.full_name ?? REPOSITORY, branch: BRANCH, canWrite, permissions: { metadata: "read", contents: "read/write" } };
}

function assertSafePath(path: string): void {
  const normalized = path.trim().replace(/^\/+/, "");
  if (!normalized || BLOCKED_PATH_PARTS.some((part) => normalized.toLowerCase().includes(part.toLowerCase()))) throw new Error("O caminho indicado não é permitido por razões de segurança.");
}

function isAllowedTextFile(path: string): boolean {
  const lower = path.toLowerCase();
  return ALLOWED_TEXT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export async function listGitHubFiles(token: string, path = ""): Promise<GitHubInventoryFile[]> {
  assertSafePath(path || "portfolio-root");
  const endpoint = `${githubRepoEndpoint(`/contents/${path.split("/").filter(Boolean).map(encodeURIComponent).join("/")}`)}?ref=${encodeURIComponent(BRANCH)}`;
  const response = await fetch(endpoint, { headers: githubHeaders(token) });
  if (!response.ok) throw await githubError(response, "Não foi possível listar os ficheiros do GitHub.");
  const payload = await response.json() as GitHubFile | GitHubFile[];
  const entries = Array.isArray(payload) ? payload : [payload];
  return entries.map((file) => ({ name: file.name ?? file.path?.split("/").pop() ?? "", path: file.path ?? "", sha: file.sha, size: file.size ?? 0, type: file.type ?? "file", url: file.html_url ?? file.download_url ?? "" }));
}

export async function readGitHubTextFile(token: string, path: string): Promise<GitHubTextFile> {
  assertSafePath(path);
  if (!isAllowedTextFile(path)) throw new Error("O editor suporta apenas ficheiros de texto permitidos.");
  const response = await fetch(`${githubEndpoint(path)}?ref=${encodeURIComponent(BRANCH)}`, { headers: githubHeaders(token) });
  if (!response.ok) throw await githubError(response, "Não foi possível ler o ficheiro remoto.");
  const file = await response.json() as GitHubFile;
  if (!file.content || file.encoding !== "base64") throw new Error("O GitHub não devolveu conteúdo textual editável.");
  return { path, sha: file.sha, content: decodeContent(file.content), size: file.size ?? 0 };
}

export async function writeGitHubTextFile(token: string, path: string, content: string, sha: string | undefined, message: string): Promise<{ sha: string }> {
  assertSafePath(path);
  if (!isAllowedTextFile(path)) throw new Error("Este tipo de ficheiro não pode ser editado pela Gestão.");
  const response = await fetch(githubEndpoint(path), { method: "PUT", headers: { ...githubHeaders(token), "Content-Type": "application/json" }, body: JSON.stringify({ message, content: encodeContent(content), branch: BRANCH, ...(sha ? { sha } : {}) }) });
  if (!response.ok) throw await githubError(response, "O GitHub não aceitou a actualização do ficheiro.");
  const payload = await response.json() as GitHubFile;
  return { sha: payload.sha };
}

async function putGitHubFile(path: string, content: string, token: string, message: string): Promise<void> {
  const endpoint = githubEndpoint(path);
  const headers = githubHeaders(token);
  const current = await fetch(`${endpoint}?ref=${encodeURIComponent(BRANCH)}`, { headers });
  let sha: string | undefined;
  if (current.ok) sha = (await current.json() as GitHubFile).sha;
  else if (current.status !== 404) throw await githubError(current, "Não foi possível aceder ao ficheiro no GitHub.");
  const update = await fetch(endpoint, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message, content, branch: BRANCH, ...(sha ? { sha } : {}) }) });
  if (!update.ok) throw await githubError(update, "O GitHub não aceitou a publicação.");
}

export function getDataUrlAsset(dataUrl: string): AssetDescriptor | null {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const extensionByMime: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", ...OFFICE_MIME, ...VIDEO_MIME };
  const extension = extensionByMime[mime];
  if (!extension) throw new Error("Formato não suportado. Use PDF, imagem, Word, Excel, PowerPoint ou vídeo MP4/WebM/MOV.");
  return { content: match[2], extension, mime, ...(OFFICE_MIME[mime] ? { type: "office" as const } : VIDEO_MIME[mime] ? { type: "video" as const } : {}) };
}

export function publicUploadUrl(filename: string): string { return `${PUBLIC_UPLOADS_URL}/${filename}`; }

async function materializeAsset(value: string | undefined, itemId: string, kind: AssetKind, token: string): Promise<string | undefined> {
  if (!value) return undefined;
  const asset = getDataUrlAsset(value);
  if (!asset) return value;
  const filename = `${itemId}-${kind}.${asset.extension}`;
  await putGitHubFile(`${UPLOADS_DIRECTORY}/${filename}`, asset.content, token, `Guardar ${kind === "image" ? "imagem" : kind === "pdf" ? "PDF" : "anexo"} do portefólio`);
  return publicUploadUrl(filename);
}

async function materializeAttachment(value: PortfolioAttachment | undefined, itemId: string, token: string): Promise<PortfolioAttachment | undefined> {
  if (!value) return undefined;
  const asset = getDataUrlAsset(value.url);
  if (!asset?.type) return value;
  const filename = `${itemId}-attachment.${asset.extension}`;
  await putGitHubFile(`${UPLOADS_DIRECTORY}/${filename}`, asset.content, token, `Guardar anexo ${value.name}`);
  return { url: publicUploadUrl(filename), name: value.name, mime: asset.mime, type: asset.type };
}

export async function savePortfolioContent(items: PortfolioItem[], token: string): Promise<PortfolioItem[]> {
  if (!token.trim()) throw new Error("Introduza um token do GitHub para publicar as alterações.");
  const publishedItems: PortfolioItem[] = [];
  for (const item of items) {
    publishedItems.push({ ...item, image: await materializeAsset(item.image, item.id, "image", token), pdf: await materializeAsset(item.pdf, item.id, "pdf", token), attachment: await materializeAttachment(item.attachment, item.id, token), externalUrl: validateExternalUrl(item.externalUrl) });
  }
  await putGitHubFile(CONTENT_PATH, encodeContent(JSON.stringify(publishedItems, null, 2)), token, "Actualizar conteúdos do portefólio");
  await saveStoredData(PORTFOLIO_CACHE_KEY, publishedItems).catch(() => undefined);
  return publishedItems;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  if (file.size > MAX_ATTACHMENT_BYTES) return Promise.reject(new Error("Cada anexo deve ter no máximo 25 MB para publicação no GitHub."));
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error ?? new Error("Não foi possível ler o ficheiro.")); reader.readAsDataURL(file); });
}

export function exportPortfolioContent(items: PortfolioItem[]): void {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "portfolio-joselio-conteudos.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export const githubConfig = { repository: REPOSITORY, branch: BRANCH, contentPath: CONTENT_PATH, uploadsDirectory: UPLOADS_DIRECTORY, allowedTextExtensions: ALLOWED_TEXT_EXTENSIONS };
