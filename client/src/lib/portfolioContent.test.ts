import { describe, expect, it, vi } from "vitest";
import { getDataUrlAsset, listGitHubFiles, loadPortfolioContent, normalizePortfolioItem, publicUploadUrl, readGitHubTextFile, validateExternalUrl, verifyGitHubAccess } from "./portfolioContent";

describe("portfolio content", () => {
  it("normalizes required fields and optional metadata", () => {
    const item = normalizePortfolioItem({ kind: "projectos", title: "  Projecto de teste  ", description: "  Descrição  ", category: "  Académico " });
    expect(item.title).toBe("Projecto de teste");
    expect(item.description).toBe("Descrição");
    expect(item.category).toBe("Académico");
    expect(item.id).toBeTypeOf("string");
  });

  it("converts a supported data URL into file content and an extension", () => {
    expect(getDataUrlAsset("data:application/pdf;base64,QUJD")).toEqual({ content: "QUJD", extension: "pdf", mime: "application/pdf" });
    expect(getDataUrlAsset("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,QUJD")).toMatchObject({ extension: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type: "office" });
    expect(getDataUrlAsset("data:video/mp4;base64,QUJD")).toMatchObject({ extension: "mp4", mime: "video/mp4", type: "video" });
    expect(getDataUrlAsset("/Jos-lio-portofolio-/uploads/already-published.pdf")).toBeNull();
  });

  it("builds a public GitHub Pages URL for an uploaded file", () => {
    expect(publicUploadUrl("projecto-imagem.png")).toBe("/Jos-lio-portofolio-/uploads/projecto-imagem.png");
  });

  it("keeps only safe HTTP(S) external links", () => {
    expect(validateExternalUrl("https://example.org/documento")).toBe("https://example.org/documento");
    expect(() => validateExternalUrl("javascript:alert(1)")).toThrow("A ligação externa deve começar");
  });

  it("validates the configured repository and branch before enabling publication", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/branches/main")) return Promise.resolve({ ok: true, json: async () => ({ name: "main" }) });
      return Promise.resolve({ ok: true, json: async () => ({ full_name: "Joselio-joao/Jos-lio-portofolio-", permissions: { push: true } }) });
    }));
    await expect(verifyGitHubAccess("github_pat_EXEMPLO")).resolves.toMatchObject({ repository: "Joselio-joao/Jos-lio-portofolio-", branch: "main", canWrite: true });
    vi.unstubAllGlobals();
  });

  it("lists repository files and reads a text file with its remote SHA", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
      if (url.includes("contents/client/public/data/portfolio-content.json")) return Promise.resolve({ ok: true, json: async () => ({ sha: "sha-1", size: 12, encoding: "base64", content: "W10=" }) });
      return Promise.resolve({ ok: true, json: async () => [{ name: "data", path: "client/public/data", sha: "sha-dir", size: 0, type: "dir", html_url: "https://github.com/example/data" }] });
    }));
    await expect(listGitHubFiles("github_pat_EXEMPLO", "client/public")).resolves.toMatchObject([{ path: "client/public/data", type: "dir" }]);
    await expect(readGitHubTextFile("github_pat_EXEMPLO", "client/public/data/portfolio-content.json")).resolves.toMatchObject({ sha: "sha-1", content: "[]" });
    vi.unstubAllGlobals();
  });

  it("loads public content even when local cache is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: "public-1", kind: "projectos", title: "Projeto público", description: "Conteúdo", updatedAt: 1 }] }));
    await expect(loadPortfolioContent()).resolves.toEqual([{ id: "public-1", kind: "projectos", title: "Projeto público", description: "Conteúdo", updatedAt: 1 }]);
    vi.unstubAllGlobals();
  });
});
