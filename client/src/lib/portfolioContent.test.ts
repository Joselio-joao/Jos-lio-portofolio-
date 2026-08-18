import { describe, expect, it } from "vitest";
import { getDataUrlAsset, normalizePortfolioItem, publicUploadUrl } from "./portfolioContent";

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
});
