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

  it("preserves historical relative and external asset references", () => {
    const item = normalizePortfolioItem({ kind: "certificados", title: "Certificado", description: "Documento", image: "/uploads/certificado.png", pdf: "https://example.org/certificado.pdf" });
    expect(item.image).toBe("/uploads/certificado.png");
    expect(item.pdf).toBe("https://example.org/certificado.pdf");
  });

  it("converts a supported data URL into file content and an extension", () => {
    expect(getDataUrlAsset("data:application/pdf;base64,QUJD")).toEqual({ content: "QUJD", extension: "pdf", mime: "application/pdf" });
    expect(getDataUrlAsset("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,QUJD")).toMatchObject({ extension: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type: "office" });
    expect(getDataUrlAsset("data:video/mp4;base64,QUJD")).toMatchObject({ extension: "mp4", mime: "video/mp4", type: "video" });
    expect(getDataUrlAsset("/Jos-lio-portofolio-/uploads/already-published.pdf")).toBeNull();
  });

  it("builds a public GitHub Pages URL for an uploaded file", () => {
    expect(publicUploadUrl("projecto-imagem.png")).toBe("/uploads/projecto-imagem.png");
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

  it("uses Supabase first and falls back to a versioned public file when unavailable", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/rest/v1/portfolio_items")) return Promise.resolve({ ok: false, status: 503, json: async () => ({}) });
      return Promise.resolve({ ok: true, json: async () => [{ id: "public-latest", kind: "projectos", title: "Versão pública actual", description: "Conteúdo actualizado", updatedAt: 2 }] });
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(loadPortfolioContent()).resolves.toEqual([{ id: "public-latest", kind: "projectos", title: "Versão pública actual", description: "Conteúdo actualizado", updatedAt: 2 }]);
    const publicCall = fetchMock.mock.calls.find(([input]) => String(input).includes("portfolio-content.json"));
    expect(publicCall?.[0]).toMatch(/portfolio-content\.json\?v=/);
    expect(publicCall?.[1]).toMatchObject({ cache: "no-store" });
    vi.unstubAllGlobals();
  });
});
