import { beforeEach, describe, expect, it } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { clearStoredTrackerData, loadLargeFileMetadata, loadTrackerData, mergeLegacyTrackerData, saveTrackerData } from "./offlineStorage";

const legacyStorage = new Map<string, string>();
Object.defineProperty(globalThis, "indexedDB", { value: indexedDB, configurable: true });
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => legacyStorage.get(key) ?? null,
    setItem: (key: string, value: string) => legacyStorage.set(key, value),
    removeItem: (key: string) => legacyStorage.delete(key),
  },
  configurable: true,
});

const fallback = { sessions: [], habits: {}, version: 1 };

describe("offlineStorage", () => {
  beforeEach(async () => {
    legacyStorage.clear();
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase("joselio-super-tracker");
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });

  it("migra dados legados sem perder os valores predefinidos", () => {
    const migrated = mergeLegacyTrackerData(fallback, JSON.stringify({ sessions: [{ id: "legacy-1" }] }));
    expect(migrated).toEqual({ sessions: [{ id: "legacy-1" }], habits: {}, version: 1 });
  });

  it("migra localStorage e preserva os dados após gravar e recarregar", async () => {
    legacyStorage.set("joselio-super-tracker-v1", JSON.stringify({ sessions: [{ id: "legacy-1" }] }));
    await expect(loadTrackerData(fallback)).resolves.toEqual({ sessions: [{ id: "legacy-1" }], habits: {}, version: 1 });

    const saved = { ...fallback, sessions: [{ id: "indexed-1" }] };
    await saveTrackerData(saved);
    await expect(loadTrackerData(fallback)).resolves.toEqual(saved);
  });

  it("limpa o registo IndexedDB e o legado", async () => {
    await saveTrackerData({ ...fallback, sessions: [{ id: "to-delete" }] });
    await clearStoredTrackerData();
    await expect(loadTrackerData(fallback)).resolves.toEqual(fallback);
  });

  it("ignora uma cópia legada inválida com segurança", () => {
    expect(mergeLegacyTrackerData(fallback, "{invalid-json")).toEqual(fallback);
  });

  it("devolve uma lista vazia de metadados OPFS quando o armazenamento ainda não existe", async () => {
    await expect(loadLargeFileMetadata()).resolves.toEqual([]);
  });
});
