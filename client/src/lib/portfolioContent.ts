export type PortfolioKind = "projectos" | "eventos" | "obras" | "certificados" | "instituicoes";
export type PortfolioItem = { id: string; kind: PortfolioKind; title: string; description: string; category?: string; image?: string; pdf?: string; externalUrl?: string; updatedAt: number };

const REPOSITORY = "Joselio-joao/Jos-lio-portofolio-";
const CONTENT_PATH = "client/public/data/portfolio-content.json";
const UPLOADS_DIRECTORY = "client/public/uploads";
const PUBLIC_CONTENT_URL = "/Jos-lio-portofolio-/data/portfolio-content.json";
const PUBLIC_UPLOADS_URL = "/Jos-lio-portofolio-/uploads";

type GitHubFile = { sha: string };
type AssetKind = "image" | "pdf";
type AssetDescriptor = { content: string; extension: string };

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
  return { id: input.id ?? crypto.randomUUID(), kind: input.kind, title: input.title.trim(), description: input.description.trim(), category: input.category?.trim() || undefined, image: input.image, pdf: input.pdf, externalUrl: validateExternalUrl(input.externalUrl), updatedAt: input.updatedAt ?? Date.now() };
}

export async function loadPortfolioContent(): Promise<PortfolioItem[]> {
  const response = await fetch(`${PUBLIC_CONTENT_URL}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return [];
  const payload: unknown = await response.json();
  return Array.isArray(payload) ? payload as PortfolioItem[] : [];
}

function encodeContent(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

function githubHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token.trim()}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
}

function githubEndpoint(path: string): string {
  return `https://api.github.com/repos/${REPOSITORY}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
}

async function githubError(response: Response, fallback: string): Promise<Error> {
  try {
    const payload = await response.json() as { message?: string };
    return new Error(payload.message ? `${fallback}: ${payload.message}` : fallback);
  } catch {
    return new Error(fallback);
  }
}

async function putGitHubFile(path: string, content: string, token: string, message: string): Promise<void> {
  const endpoint = githubEndpoint(path);
  const headers = githubHeaders(token);
  const current = await fetch(endpoint, { headers });
  let sha: string | undefined;

  if (current.ok) {
    sha = (await current.json() as GitHubFile).sha;
  } else if (current.status !== 404) {
    throw await githubError(current, "Não foi possível aceder ao ficheiro no GitHub. Confirme que o token tem acesso ao repositório e permissão Contents: Read and write");
  }

  const update = await fetch(endpoint, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ message, content, ...(sha ? { sha } : {}) }),
  });
  if (!update.ok) throw await githubError(update, "O GitHub não aceitou a publicação");
}

export function getDataUrlAsset(dataUrl: string): AssetDescriptor | null {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const extensionByMime: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const extension = extensionByMime[mime];
  if (!extension) throw new Error("O formato do ficheiro selecionado não é suportado. Use PDF, JPG, PNG, WEBP ou GIF.");
  return { content: match[2], extension };
}

export function publicUploadUrl(filename: string): string {
  return `${PUBLIC_UPLOADS_URL}/${filename}`;
}

async function materializeAsset(value: string | undefined, itemId: string, kind: AssetKind, token: string): Promise<string | undefined> {
  if (!value) return undefined;
  const asset = getDataUrlAsset(value);
  if (!asset) return value;
  const filename = `${itemId}-${kind}.${asset.extension}`;
  await putGitHubFile(`${UPLOADS_DIRECTORY}/${filename}`, asset.content, token, `Guardar ${kind === "image" ? "imagem" : "PDF"} do portefólio`);
  return publicUploadUrl(filename);
}

export async function savePortfolioContent(items: PortfolioItem[], token: string): Promise<PortfolioItem[]> {
  if (!token.trim()) throw new Error("Introduza um token do GitHub para publicar as alterações.");

  const publishedItems: PortfolioItem[] = [];
  for (const item of items) {
    publishedItems.push({
      ...item,
      image: await materializeAsset(item.image, item.id, "image", token),
      pdf: await materializeAsset(item.pdf, item.id, "pdf", token),
      externalUrl: validateExternalUrl(item.externalUrl),
    });
  }

  await putGitHubFile(CONTENT_PATH, encodeContent(JSON.stringify(publishedItems, null, 2)), token, "Atualizar conteúdos do portefólio");
  return publishedItems;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Não foi possível ler o ficheiro."));
    reader.readAsDataURL(file);
  });
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
