import { describe, expect, it } from "vitest";
import { normalizePortfolioItem } from "./portfolioContent";

describe("portfolio content", () => {
  it("normalizes required fields and optional metadata", () => {
    const item = normalizePortfolioItem({ kind: "projectos", title: "  Projecto de teste  ", description: "  Descrição  ", category: "  Académico " });
    expect(item.title).toBe("Projecto de teste");
    expect(item.description).toBe("Descrição");
    expect(item.category).toBe("Académico");
    expect(item.id).toBeTypeOf("string");
  });
});
