import type { PortfolioItem } from "./portfolioContent";
import { supabase } from "./supabase";

const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "");
const FUNCTION_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/portofolio-access` : "";
const TOKEN_KEY = "portfolio-proxy-session";

type ProxySession = { token: string; expiresAt: number; role?: "visitor" };
export type PortfolioAccessLog = { id: string; accessedAt: string; success: boolean; userAgent?: string };

function readSession(): ProxySession | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ProxySession;
    if (!session.token || session.expiresAt <= Date.now()) { sessionStorage.removeItem(TOKEN_KEY); return null; }
    return session;
  } catch { return null; }
}

export function hasPortfolioProxySession(): boolean { return Boolean(readSession()); }
export function clearPortfolioProxySession(): void { sessionStorage.removeItem(TOKEN_KEY); }

async function request<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  if (!FUNCTION_URL) throw new Error("O Supabase não está configurado neste deployment.");
  const session = readSession();
  const ownerToken = !session && supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  const bearerToken = session?.token ?? ownerToken;
  const response = await fetch(FUNCTION_URL, { method: "POST", headers: { "Content-Type": "application/json", ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}), ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}) }, body: JSON.stringify({ action, ...body }) });
  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error ?? "Não foi possível concluir o pedido.");
  return payload;
}

export async function signInWithOwnerPassword(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("O Supabase não está configurado neste deployment.");
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signInWithVisitorPassword(password: string): Promise<void> {
  const normalizedPassword = password.trim();
  if (!normalizedPassword) throw new Error("Introduza a palavra-passe de visitante.");
  const payload = await request<{ token: string; expiresAt: number; role: "visitor" }>("visitor_login", { password: normalizedPassword, userAgent: navigator.userAgent });
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(payload));
}

export async function loadProxyPortfolioContent(): Promise<PortfolioItem[]> { return (await request<{ items: PortfolioItem[] }>("list")).items; }
export async function saveProxyPortfolioContent(items: PortfolioItem[]): Promise<PortfolioItem[]> { return (await request<{ items: PortfolioItem[] }>("save", { items })).items; }
export type VisitorPassword = { id: string; label?: string; createdAt: string; expiresAt: string; usedAt?: string };

async function ownerFunction<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  if (!supabase) throw new Error("O Supabase não está configurado neste deployment.");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(`Sessão Supabase: ${sessionError.message}`);
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Sessão owner inexistente ou expirada. Termine a sessão e entre novamente.");
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}), Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(`Edge Function ${response.status}: ${payload.error ?? "resposta sem detalhes"}`);
  if (payload.error) throw new Error(`Edge Function ${response.status}: ${String(payload.error)}`);
  return payload as T;
}

function generateLocalPassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...Array.from(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "").slice(0, 16);
}

async function hashLocalPassword(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function generateVisitorPasswordDirectly(label: string, expiresInHours: number): Promise<{ password: string; record: VisitorPassword }> {
  if (!supabase) throw new Error("O Supabase não está configurado neste deployment.");
  const { data: sessionData } = await supabase.auth.getSession();
  const ownerId = sessionData.session?.user.id;
  if (!ownerId) throw new Error("Sessão owner inexistente ou expirada. Termine a sessão e entre novamente.");
  const password = generateLocalPassword();
  const expiresAt = new Date(Date.now() + Math.min(168, Math.max(1, Number(expiresInHours) || 24)) * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from("portfolio_visitor_passwords").insert({ owner_user_id: ownerId, password_hash: await hashLocalPassword(password), label: label.trim().slice(0, 120) || null, expires_at: expiresAt }).select("id,label,created_at,expires_at,used_at").single();
  if (error) throw error;
  return { password, record: { id: data.id, label: data.label ?? undefined, createdAt: data.created_at, expiresAt: data.expires_at, usedAt: data.used_at ?? undefined } };
}

export async function generateVisitorPassword(label: string, expiresInHours: number): Promise<{ password: string; record: VisitorPassword }> {
  try {
    return await ownerFunction<{ password: string; record: VisitorPassword }>("owner_generate_visitor_password", { label, expiresInHours });
  } catch (error) {
    if (error instanceof Error && /Edge Function (4\d{2}|5\d{2})/.test(error.message)) return generateVisitorPasswordDirectly(label, expiresInHours);
    throw error;
  }
}

export async function loadVisitorPasswords(): Promise<VisitorPassword[]> {
  try {
    return (await ownerFunction<{ passwords: VisitorPassword[] }>("owner_list_visitor_passwords")).passwords;
  } catch (edgeError) {
    if (!supabase) throw edgeError;
    const { data, error } = await supabase.from("portfolio_visitor_passwords").select("id,label,created_at,expires_at,used_at").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, label: row.label ?? undefined, createdAt: row.created_at, expiresAt: row.expires_at, usedAt: row.used_at ?? undefined }));
  }
}

export async function revokeVisitorPassword(id: string): Promise<void> {
  try {
    await ownerFunction("owner_revoke_visitor_password", { id });
  } catch (edgeError) {
    if (!supabase) throw edgeError;
    const { error } = await supabase.from("portfolio_visitor_passwords").update({ expires_at: new Date().toISOString() }).eq("id", id).is("used_at", null);
    if (error) throw error;
  }
}

export async function loadPortfolioAccessLogs(): Promise<PortfolioAccessLog[]> {
  if (supabase) {
    try {
      return (await ownerFunction<{ logs: PortfolioAccessLog[] }>("owner_logs")).logs;
    } catch (edgeError) {
      const { data, error } = await supabase.from("portfolio_access_logs").select("id,accessed_at,success,user_agent").order("accessed_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []).map((row) => ({ id: row.id, accessedAt: row.accessed_at, success: row.success, userAgent: row.user_agent ?? undefined }));
    }
  }
  return (await request<{ logs: PortfolioAccessLog[] }>("logs")).logs;
}
