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
  const payload = await request<{ token: string; expiresAt: number; role: "visitor" }>("visitor_login", { password, userAgent: navigator.userAgent });
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

export async function generateVisitorPassword(label: string, expiresInHours: number): Promise<{ password: string; record: VisitorPassword }> {
  return ownerFunction<{ password: string; record: VisitorPassword }>("owner_generate_visitor_password", { label, expiresInHours });
}

export async function loadVisitorPasswords(): Promise<VisitorPassword[]> {
  return (await ownerFunction<{ passwords: VisitorPassword[] }>("owner_list_visitor_passwords")).passwords;
}

export async function revokeVisitorPassword(id: string): Promise<void> {
  await ownerFunction("owner_revoke_visitor_password", { id });
}

export async function loadPortfolioAccessLogs(): Promise<PortfolioAccessLog[]> {
  if (supabase) return (await ownerFunction<{ logs: PortfolioAccessLog[] }>("owner_logs")).logs;
  return (await request<{ logs: PortfolioAccessLog[] }>("logs")).logs;
}
