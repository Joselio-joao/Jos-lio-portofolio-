import { describe, expect, it } from "vitest";

describe("Supabase public configuration", () => {
  it("accepts the configured public project credentials", async () => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    expect(url, "VITE_SUPABASE_URL não está configurada").toMatch(/^https:\/\/[^/]+\.supabase\.co\/?$/);
    expect(anonKey, "VITE_SUPABASE_ANON_KEY não está configurada").toMatch(/^eyJ/);

    const response = await fetch(`${url!.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: anonKey! },
    });

    expect(response.ok, `Supabase respondeu com HTTP ${response.status}`).toBe(true);
  });
});
