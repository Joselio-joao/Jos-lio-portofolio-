import { saveStoredData, loadStoredData } from "./offlineStorage";
import { supabase } from "./supabase";
import { hasPortfolioProxySession, loadProxyPortfolioContent, saveProxyPortfolioContent } from "./portfolioProxy";

export type PortfolioKind = "projectos" | "eventos" | "obras" | "certificados" | "instituicoes";
export type PortfolioAttachment = { url: string; name: string; mime: string; type: "office" | "video" };
export type PortfolioItem = { id: string; kind: PortfolioKind; title: string; description: string; category?: string; groupIds?: string[]; image?: string; pdf?: string; attachment?: PortfolioAttachment; externalUrl?: string; updatedAt: number };
export type OwnerPublishingDiagnostic = { session: boolean; owner: boolean; canWrite: boolean; itemsReadable: boolean; storageReadable: boolean; issue?: string };

export type GitHubInventoryFile = { name: string; path: string; sha: string; size: number; type: "file" | "dir"; url: string };
export type GitHubSession = { repository: string; branch: string; canWrite: boolean; permissions: { metadata?: string; contents?: string } };
export type GitHubTextFile = { path: string; sha: string; content: string; size: number };

const REPOSITORY = "Joselio-joao/Jos-lio-portofolio-";
const BRANCH = "main";
const CONTENT_PATH = "client/public/data/portfolio-content.json";
const UPLOADS_DIRECTORY = "client/public/uploads";
const PUBLIC_CONTENT_URL = `${import.meta.env.BASE_URL}data/portfolio-content.json`;

function publicContentUrl(): string {
  return `${PUBLIC_CONTENT_URL}?v=${Date.now()}`;
}

function normalizeLegacyAssetUrl(value: string | undefined): string | undefined {
  if (!value || /^(https?:\/\/|data:)/i.test(value)) return value;
  const withoutRepositoryPrefix = value.replace(/^\/Jos-lio-portofolio-\//, "/");
  return withoutRepositoryPrefix;
}

function mergeLegacyAssets(items: PortfolioItem[], legacy: PortfolioItem[]): PortfolioItem[] {
  const byId = new Map(legacy.map((item) => [item.id, item]));
  const byTitle = new Map(legacy.map((item) => [item.title.trim().toLowerCase(), item]));
  const merged = items.map((item) => {
    const fallback = byId.get(item.id) ?? byTitle.get(item.title.trim().toLowerCase());
    if (!fallback) return item;
    return { ...item, image: item.image || fallback.image, pdf: item.pdf || fallback.pdf, attachment: item.attachment?.url ? item.attachment : fallback.attachment, externalUrl: item.externalUrl || fallback.externalUrl };
  });
  const seen = new Set(merged.flatMap((item) => [item.id, item.title.trim().toLowerCase()]));
  return [...merged, ...legacy.filter((item) => !seen.has(item.id) && !seen.has(item.title.trim().toLowerCase()))];
}
const PUBLIC_UPLOADS_URL = `${import.meta.env.BASE_URL}uploads`;
const PORTFOLIO_CACHE_KEY = "portfolio-content-cache-v1";
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const BLOCKED_PATH_PARTS = ["..", ".git", ".env", "credentials", "secrets"];
const ALLOWED_TEXT_EXTENSIONS = [".html", ".css", ".js", ".json", ".md", ".txt", ".xml", ".svg", ".webmanifest"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ErrorLike = { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };

export function readablePortfolioError(error: unknown, fallback: string): string {
  const source = (error && typeof error === "object" ? error : {}) as ErrorLike;
  const code = typeof source.code === "string" ? source.code : "";
  const message = typeof source.message === "string" ? source.message : error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();
  if (code === "42501" || normalized.includes("row-level security") || normalized.includes("permission denied")) return "A sessão entrou, mas o Supabase ainda bloqueia a escrita por RLS. Execute a correcção de publicação RLS e actualize esta página.";
  if (normalized.includes("jwt") || normalized.includes("session") || normalized.includes("not authenticated")) return "A sessão expirou. Termine a sessão, entre novamente como proprietário e tente de novo.";
  if (normalized.includes("storage") || normalized.includes("bucket")) return "O Supabase bloqueou o ficheiro no Storage privado. Confirme a correcção de publicação RLS e tente novamente.";
  return message || fallback;
}

export async function normalizeSupabaseItemId(id: string): Promise<string> {
  const candidate = id.trim();
  if (UUID_PATTERN.test(candidate)) return candidate.toLowerCase();
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`portfolio-item:${candidate}`)));
  digest[6] = (digest[6] & 0x0f) | 0x50;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = Array.from(digest.slice(0, 16), (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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
    const rawItems = Array.isArray(payload) ? payload : (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items) ? (payload as { items: PortfolioItem[] }).items : []);
    const items = rawItems.map((item) => ({ ...item, image: normalizeLegacyAssetUrl(item.image), pdf: normalizeLegacyAssetUrl(item.pdf), attachment: item.attachment ? { ...item.attachment, url: normalizeLegacyAssetUrl(item.attachment.url) ?? item.attachment.url } : undefined }));
    await saveStoredData(PORTFOLIO_CACHE_KEY, items).catch(() => undefined);
    return items;
  } catch {
    return null;
  }
}

type SupabasePortfolioRow = {
  id: string;
  kind: PortfolioKind;
  title: string;
  description: string;
  category: string | null;
  group_id: string | null;
  image_path: string | null;
  pdf_path: string | null;
  attachment_path: string | null;
  external_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  updated_at: string;
  order_index: number;
};

async function signedStorageUrl(path: string | null): Promise<string | undefined> {
  if (!path) return undefined;
  if (/^(https?:\/\/|data:|\/)/i.test(path)) return path;
  if (!supabase) return undefined;
  const { data, error } = await supabase.storage.from("portfolio-private").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

function attachmentFromPath(path: string | null, mime: string | null): PortfolioAttachment | undefined {
  if (!path) return undefined;
  const name = path.split("/").pop() ?? path;
  const type = mime?.startsWith("video/") ? "video" : "office";
  return { url: "", name, mime: mime ?? "application/octet-stream", type };
}

async function rowToPortfolioItem(row: SupabasePortfolioRow): Promise<PortfolioItem> {
  const [image, pdf, attachmentUrl] = await Promise.all([signedStorageUrl(row.image_path), signedStorageUrl(row.pdf_path), signedStorageUrl(row.attachment_path)]);
  const attachment = attachmentFromPath(row.attachment_path, row.mime_type);
  return { id: row.id, kind: row.kind, title: row.title, description: row.description, category: row.category ?? undefined, image, pdf, attachment: attachment ? { ...attachment, url: attachmentUrl ?? "" } : undefined, externalUrl: row.external_url ?? undefined, updatedAt: Date.parse(row.updated_at) || Date.now() };
}

async function refreshSupabasePortfolioContent(): Promise<PortfolioItem[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("portfolio_items").select("*").eq("status", "published").order("order_index", { ascending: true }).order("updated_at", { ascending: false });
  if (error) return null;
  return Promise.all((data as SupabasePortfolioRow[]).map(rowToPortfolioItem));
}

export async function diagnoseOwnerPublishing(): Promise<OwnerPublishingDiagnostic> {
  if (!supabase) return { session: false, owner: false, canWrite: false, itemsReadable: false, storageReadable: false, issue: "O Supabase não está configurado neste deployment." };
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (sessionError || !user) return { session: false, owner: false, canWrite: false, itemsReadable: false, storageReadable: false, issue: "A sessão de proprietário não está disponível." };
  const [{ data: membership, error: membershipError }, { data: writePermission, error: writeError }, { error: itemsError }, { error: storageError }] = await Promise.all([
    supabase.from("portfolio_members").select("role").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("can_edit_portfolio"),
    supabase.from("portfolio_items").select("id").limit(1),
    supabase.storage.from("portfolio-private").list("items", { limit: 1 }),
  ]);
  const owner = membership?.role === "owner" || membership?.role === "editor";
  const canWrite = writePermission === true;
  const issue = membershipError ? readablePortfolioError(membershipError, "Não foi possível consultar o papel do utilizador.") : writeError ? readablePortfolioError(writeError, "O Supabase não permitiu confirmar a escrita.") : !canWrite ? "A sessão existe, mas o Supabase não reconhece esta conta com permissão de escrita. Execute a correcção RLS da Gestão." : itemsError ? readablePortfolioError(itemsError, "Não foi possível consultar a tabela de conteúdos.") : storageError ? readablePortfolioError(storageError, "Não foi possível consultar o Storage privado.") : undefined;
  return { session: true, owner, canWrite, itemsReadable: !itemsError, storageReadable: !storageError, issue };
}

export async function loadPortfolioContent(): Promise<PortfolioItem[]> {
  const supabaseSession = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (supabaseSession) {
    const supabaseItems = await refreshSupabasePortfolioContent();
    if (supabaseItems !== null) {
      const legacyItems = await refreshPortfolioContent();
      const mergedItems = legacyItems && legacyItems.length > 0 ? (supabaseItems.length > 0 ? mergeLegacyAssets(supabaseItems, legacyItems) : legacyItems) : supabaseItems;
      await saveStoredData(PORTFOLIO_CACHE_KEY, mergedItems).catch(() => undefined);
      return mergedItems;
    }
  }
  if (hasPortfolioProxySession()) {
    try {
      const proxyItems = await loadProxyPortfolioContent();
      const legacyItems = await refreshPortfolioContent();
      const mergedItems = legacyItems && legacyItems.length > 0 ? (proxyItems.length > 0 ? mergeLegacyAssets(proxyItems, legacyItems) : legacyItems) : proxyItems;
      await saveStoredData(PORTFOLIO_CACHE_KEY, mergedItems).catch(() => undefined);
      return mergedItems;
    } catch {
      const legacyItems = await refreshPortfolioContent();
      if (legacyItems && legacyItems.length > 0) return legacyItems;
      return (await loadStoredData<PortfolioItem[] | null>(PORTFOLIO_CACHE_KEY, null)) ?? [];
    }
  }
  const supabaseItems = await refreshSupabasePortfolioContent();
  if (supabaseItems !== null) {
    await saveStoredData(PORTFOLIO_CACHE_KEY, supabaseItems).catch(() => undefined);
    return supabaseItems;
  }
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

function storagePathFromUrl(value: string | undefined): string | null {
  if (!value) return null;
  const marker = "/storage/v1/object/sign/portfolio-private/";
  const index = value.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(value.slice(index + marker.length).split("?")[0]);
}

async function uploadSupabaseDataUrl(value: string | undefined, path: string): Promise<string | null> {
  if (!value || !supabase) return null;
  const asset = getDataUrlAsset(value);
  if (!asset) return storagePathFromUrl(value);
  const binary = Uint8Array.from(atob(asset.content), (character) => character.charCodeAt(0));
  const { error } = await supabase.storage.from("portfolio-private").upload(path, binary, { contentType: asset.mime, upsert: true });
  if (error) throw error;
  return path;
}

async function saveSupabasePortfolioContent(items: PortfolioItem[]): Promise<PortfolioItem[]> {
  if (!supabase) throw new Error("O Supabase não está configurado.");
  const normalizedItems = await Promise.all(items.map(async (item) => ({ ...item, id: await normalizeSupabaseItemId(item.id) })));
  const rows = [];
  for (const item of normalizedItems) {
    const imagePath = await uploadSupabaseDataUrl(item.image, `items/${item.id}/image.${getDataUrlAsset(item.image ?? "")?.extension ?? "bin"}`);
    const pdfPath = await uploadSupabaseDataUrl(item.pdf, `items/${item.id}/pdf.pdf`);
    const attachmentAsset = getDataUrlAsset(item.attachment?.url ?? "");
    const attachmentPath = await uploadSupabaseDataUrl(item.attachment?.url, `items/${item.id}/attachment.${attachmentAsset?.extension ?? "bin"}`);
    rows.push({ id: item.id, kind: item.kind, title: item.title.trim(), description: item.description.trim(), category: item.category ?? null, group_id: null, image_path: imagePath, pdf_path: pdfPath, attachment_path: attachmentPath, external_url: validateExternalUrl(item.externalUrl) ?? null, mime_type: item.attachment?.mime ?? null, file_size: null, status: "published", order_index: 0, updated_at: new Date(item.updatedAt).toISOString() });
  }
  const { data, error } = await supabase.from("portfolio_items").upsert(rows, { onConflict: "id" }).select("*");
  if (error) throw error;
  const keepIds = new Set(normalizedItems.map((item) => item.id));
  const { data: existingRows, error: existingError } = await supabase.from("portfolio_items").select("id");
  if (existingError) throw existingError;
  const removedIds = (existingRows as Array<{ id: string }>).map((row) => row.id).filter((id) => !keepIds.has(id));
  if (removedIds.length) {
    const { error: removeError } = await supabase.from("portfolio_items").delete().in("id", removedIds);
    if (removeError) throw removeError;
  }
  const published = await Promise.all((data as SupabasePortfolioRow[]).map(rowToPortfolioItem));
  await saveStoredData(PORTFOLIO_CACHE_KEY, published).catch(() => undefined);
  return published;
}

async function materializeAttachment(value: PortfolioAttachment | undefined, itemId: string, token: string): Promise<PortfolioAttachment | undefined> {
  if (!value) return undefined;
  const asset = getDataUrlAsset(value.url);
  if (!asset?.type) return value;
  const filename = `${itemId}-attachment.${asset.extension}`;
  await putGitHubFile(`${UPLOADS_DIRECTORY}/${filename}`, asset.content, token, `Guardar anexo ${value.name}`);
  return { url: publicUploadUrl(filename), name: value.name, mime: asset.mime, type: asset.type };
}

export async function savePortfolioContent(items: PortfolioItem[], token = ""): Promise<PortfolioItem[]> {
  if (hasPortfolioProxySession()) {
    return saveProxyPortfolioContent(items);
  }
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return saveSupabasePortfolioContent(items);
  }
  if (!token.trim()) throw new Error("Inicie sessão no Supabase ou introduza um token do GitHub para publicar as alterações.");
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

export async function importLegacyPortfolioContent(): Promise<PortfolioItem[]> {
  if (!supabase) throw new Error("O Supabase não está configurado.");
  const response = await fetch(PUBLIC_CONTENT_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível ler o conteúdo histórico para migração.");
  const payload = await response.json() as unknown;
  if (!Array.isArray(payload)) throw new Error("O conteúdo histórico não tem um formato válido.");
  return saveSupabasePortfolioContent(payload as PortfolioItem[]);
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
