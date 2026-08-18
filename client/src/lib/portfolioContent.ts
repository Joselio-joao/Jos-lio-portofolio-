import { loadStoredData, saveStoredData } from "./offlineStorage";

export type PortfolioKind = "projectos" | "eventos" | "obras" | "certificados" | "instituicoes";
export type PortfolioItem = { id: string; kind: PortfolioKind; title: string; description: string; category?: string; image?: string; pdf?: string; updatedAt: number };
const CONTENT_KEY = "portfolio-content-v1";

export function normalizePortfolioItem(input: Pick<PortfolioItem, "kind" | "title" | "description"> & Partial<PortfolioItem>): PortfolioItem {
  return { id: input.id ?? crypto.randomUUID(), kind: input.kind, title: input.title.trim(), description: input.description.trim(), category: input.category?.trim() || undefined, image: input.image, pdf: input.pdf, updatedAt: input.updatedAt ?? Date.now() };
}

export async function loadPortfolioContent(): Promise<PortfolioItem[]> {
  return loadStoredData<PortfolioItem[]>(CONTENT_KEY, []);
}

export async function savePortfolioContent(items: PortfolioItem[]): Promise<void> {
  await saveStoredData(CONTENT_KEY, items);
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
