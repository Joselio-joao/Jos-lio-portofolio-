import { describe, expect, it } from "vitest";
import { clearTrackerSection, confirmDestructiveAction } from "./trackerData";

const store = {
  sessions: [{ id: "study-1" }],
  assessments: [{ id: "grade-1" }],
  universityTasks: [{ id: "task-1" }],
  scholarships: [{ id: "scholar-1" }],
  habits: { "2026-08-17": { Estudo: true } },
};

describe("clearTrackerSection", () => {
  it("limpa apenas a área pedida e preserva os restantes dados", () => {
    const cleared = clearTrackerSection(store, "sessions");
    expect(cleared.sessions).toEqual([]);
    expect(cleared.assessments).toEqual(store.assessments);
    expect(cleared.universityTasks).toEqual(store.universityTasks);
  });

  it("limpa todas as áreas quando o utilizador confirma apagar tudo", () => {
    const cleared = clearTrackerSection(store, "all");
    expect(cleared).toEqual({ sessions: [], assessments: [], universityTasks: [], scholarships: [], habits: {} });
  });

  it("preserva os dados quando a confirmação de apagamento é cancelada", () => {
    let executed = false;
    const result = confirmDestructiveAction(() => false, "Apagar?", () => { executed = true; });
    expect(result).toBe(false);
    expect(executed).toBe(false);
  });

  it("executa a eliminação apenas quando a confirmação é aceite", () => {
    let executed = false;
    const result = confirmDestructiveAction(() => true, "Apagar?", () => { executed = true; });
    expect(result).toBe(true);
    expect(executed).toBe(true);
  });
});
