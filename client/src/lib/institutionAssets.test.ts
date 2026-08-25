import { describe, expect, it } from "vitest";
import { SAYLOR_ACADEMY_LOGO, institutionImage } from "./institutionAssets";

describe("institutionImage", () => {
  it("associa o logótipo da Saylor ao registo institucional sem imagem", () => {
    expect(institutionImage("Saylor.org Academy")).toBe(SAYLOR_ACADEMY_LOGO);
  });

  it("preserva a imagem definida pelo próprio utilizador", () => {
    expect(institutionImage("Saylor Academy", "https://example.org/logo.png")).toBe("https://example.org/logo.png");
  });
});
