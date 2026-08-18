import { describe, expect, it, vi } from "vitest";
import { getDataUrlAsset, loadPortfolioContent, normalizePortfolioItem, publicUploadUrl, validateExternalUrl } from "./portfolioContent";

describe("portfolio content", () => {
  it("normalizes required fields and optional metadata", () => {
    const item = normalizePortfolioItem({ kind: "projectos", title: "  Projecto de teste  ", description: "  Descrição  ", category: "  Académico " });
    expect(item.title).toBe("Projecto de teste");
    expect(item.description).toBe("Descrição");
    expect(item.category).toBe("Académico");
    expect(item.id).toBeTypeOf("string");
  });

  it("converts a supported data URL into file content and an extension", () => {
    expect(getDataUrlAsset("data:application/pdf;base64,QUJD")).toEqual({ content: "QUJD", extension: "pdf" });
    expect(getDataUrlAsset("/Jos-lio-portofolio-/uploads/already-published.pdf")).toBeNull();
  });

  it("builds a public GitHub Pages URL for an uploaded file", () => {
    expect(publicUploadUrl("projecto-imagem.png")).toBe("/Jos-lio-portofolio-/uploads/projecto-imagem.png");
  });

  it("keeps only safe HTTP(S) external links", () => {
    expect(validateExternalUrl("https://example.org/documento")).toBe("https://example.org/documento");
    expect(() => validateExternalUrl("javascript:alert(1)")).toThrow("A ligação externa deve começar");
  });

  it("loads public content even when local cache is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: "public-1", kind: "projectos", title: "Projeto público", description: "Conteúdo", updatedAt: 1 }] }));
    await expect(loadPortfolioContent()).resolves.toEqual([{ id: "public-1", kind: "projectos", title: "Projeto público", description: "Conteúdo", updatedAt: 1 }]);
    vi.unstubAllGlobals();
  });
});
