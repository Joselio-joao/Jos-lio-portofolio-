export type PortfolioKind = "projectos" | "eventos" | "obras" | "certificados" | "instituicoes";
export type PortfolioItem = { id: string; kind: PortfolioKind; title: string; description: string; category?: string; image?: string; pdf?: string; updatedAt: number };
const REPOSITORY = "Joselio-joao/Jos-lio-portofolio-";
const CONTENT_PATH = "client/public/data/portfolio-content.json";
const PUBLIC_CONTENT_URL = "/Jos-lio-portofolio-/data/portfolio-content.json";

export function normalizePortfolioItem(input: Pick<PortfolioItem, "kind" | "title" | "description"> & Partial<PortfolioItem>): PortfolioItem {
  return { id: input.id ?? crypto.randomUUID(), kind: input.kind, title: input.title.trim(), description: input.description.trim(), category: input.category?.trim() || undefined, image: input.image, pdf: input.pdf, updatedAt: input.updatedAt ?? Date.now() };
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

type GitHubFile = { sha: string };

async function githubError(response: Response, fallback: string): Promise<Error> {
  try {
    const payload = await response.json() as { message?: string };
    return new Error(payload.message ? `${fallback}: ${payload.message}` : fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function savePortfolioContent(items: PortfolioItem[], token: string): Promise<void> {
  if (!token.trim()) throw new Error("Introduza um token do GitHub para publicar as alterações.");
  const endpoint = `https://api.github.com/repos/${REPOSITORY}/contents/${CONTENT_PATH}`;
  const headers = { Authorization: `Bearer ${token.trim()}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const current = await fetch(endpoint, { headers });
  if (!current.ok) throw await githubError(current, "Não foi possível aceder ao ficheiro no GitHub. Confirme que o token tem acesso ao repositório e permissão Contents: Read and write");
  const file = await current.json() as GitHubFile;
  const update = await fetch(endpoint, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: "Atualizar conteúdos do portefólio", content: encodeContent(JSON.stringify(items, null, 2)), sha: file.sha }) });
  if (!update.ok) throw await githubError(update, "O GitHub não aceitou a publicação");
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
