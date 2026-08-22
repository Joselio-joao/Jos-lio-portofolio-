import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const SESSION_TTL = 8 * 60 * 60 * 1000;
type Row = Record<string, unknown>;
function json(body: Row, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
function base64Url(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }
function fromBase64Url(value: string): Uint8Array { const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4); return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0)); }
async function key(secret: string) { return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]); }
async function hash(value: string): Promise<string> { return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))); }
async function createToken(secret: string, role: "visitor") { const expiresAt = Date.now() + SESSION_TTL; const payload = base64Url(new TextEncoder().encode(JSON.stringify({ exp: expiresAt, role }))); const signature = base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), new TextEncoder().encode(payload)))); return { token: `${payload}.${signature}`, expiresAt, role }; }
async function ownerFromRequest(admin: ReturnType<typeof createClient>, request: Request): Promise<{ id: string } | null> {
  const jwt = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!jwt) return null;
  const { data: authData } = await admin.auth.getUser(jwt);
  if (!authData.user) return null;
  const { data: member } = await admin.from("portfolio_members").select("user_id").eq("user_id", authData.user.id).eq("role", "owner").maybeSingle();
  return member ? { id: authData.user.id } : null;
}

function randomPassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return base64Url(bytes).slice(0, 16);
}

async function tokenRole(request: Request, secret: string): Promise<"visitor" | null> { const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); if (!token) return null; const [payload, signature] = token.split("."); if (!payload || !signature) return null; try { const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as { exp?: number; role?: "visitor" }; const valid = Boolean(data.exp && data.exp > Date.now() && data.role === "visitor" && await crypto.subtle.verify("HMAC", await key(secret), fromBase64Url(signature), new TextEncoder().encode(payload))); return valid ? "visitor" : null; } catch { return null; } }
function dataUrl(value: unknown): { bytes: Uint8Array; mime: string; extension: string } | null { if (typeof value !== "string") return null; const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/i.exec(value); if (!match) return null; const extension = match[1].split("/")[1]?.replace("jpeg", "jpg") ?? "bin"; return { bytes: Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0)), mime: match[1], extension }; }
function pathFromUrl(value: unknown): string | null { if (typeof value !== "string") return null; const marker = "/storage/v1/object/sign/portfolio-private/"; const index = value.indexOf(marker); return index >= 0 ? decodeURIComponent(value.slice(index + marker.length).split("?")[0]) : null; }
async function assetUrl(admin: ReturnType<typeof createClient>, value: unknown): Promise<string | undefined> { if (typeof value !== "string" || !value) return undefined; if (/^(https?:\/\/|data:|\/)/i.test(value)) return value; const { data } = await admin.storage.from("portfolio-private").createSignedUrl(value, 3600); return data?.signedUrl; }
async function itemToPublic(admin: ReturnType<typeof createClient>, row: Row) { const [image, pdf, attachmentUrl] = await Promise.all([assetUrl(admin, row.image_path), assetUrl(admin, row.pdf_path), assetUrl(admin, row.attachment_path)]); const mime = typeof row.mime_type === "string" ? row.mime_type : "application/octet-stream"; return { id: row.id, kind: row.kind, title: row.title, description: row.description, category: row.category ?? undefined, image, pdf, attachment: row.attachment_path ? { url: attachmentUrl ?? "", name: String(row.attachment_path).split("/").pop(), mime, type: mime.startsWith("video/") ? "video" : "office" } : undefined, externalUrl: row.external_url ?? undefined, updatedAt: Date.parse(String(row.updated_at)) || Date.now() }; }
async function materialize(admin: ReturnType<typeof createClient>, value: unknown, path: string): Promise<string | null> { if (!value) return null; const existing = pathFromUrl(value); if (existing) return existing; const asset = dataUrl(value); if (!asset) return typeof value === "string" ? value : null; const { error } = await admin.storage.from("portfolio-private").upload(path.replace(/\.bin$/, `.${asset.extension}`), asset.bytes, { contentType: asset.mime, upsert: true }); if (error) throw error; return path.replace(/\.bin$/, `.${asset.extension}`); }

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);
  const supabaseUrl = Deno.env.get("SUPABASE_URL"); const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); const sessionSecret = Deno.env.get("PORTFOLIO_SESSION_SECRET");
  if (!supabaseUrl || !serviceRole || !sessionSecret) return json({ error: "A função de acesso ainda não está configurada." }, 500);
  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  try {
    const body = await request.json() as { action?: string; password?: string; userAgent?: string; items?: Array<Row> };
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = await hash(ip);
    if (body.action === "owner_generate_visitor_password" || body.action === "owner_list_visitor_passwords" || body.action === "owner_revoke_visitor_password" || body.action === "owner_logs") {
      const owner = await ownerFromRequest(admin, request);
      if (!owner) return json({ error: "Apenas o proprietário pode executar esta operação." }, 403);
      if (body.action === "owner_generate_visitor_password") {
        const value = randomPassword();
        const hours = Math.min(168, Math.max(1, Number(body.expiresInHours) || 24));
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        const { data, error } = await admin.from("portfolio_visitor_passwords").insert({ owner_user_id: owner.id, password_hash: await hash(value), label: typeof body.label === "string" ? body.label.slice(0, 120) : null, expires_at: expiresAt }).select("id,label,created_at,expires_at,used_at").single();
        if (error) throw error;
        return json({ password: value, record: { id: data.id, label: data.label ?? undefined, createdAt: data.created_at, expiresAt: data.expires_at, usedAt: data.used_at ?? undefined } });
      }
      if (body.action === "owner_list_visitor_passwords") {
        const { data, error } = await admin.from("portfolio_visitor_passwords").select("id,label,created_at,expires_at,used_at").eq("owner_user_id", owner.id).order("created_at", { ascending: false }).limit(100);
        if (error) throw error;
        return json({ passwords: (data ?? []).map((row) => ({ id: row.id, label: row.label ?? undefined, createdAt: row.created_at, expiresAt: row.expires_at, usedAt: row.used_at ?? undefined })) });
      }
      if (body.action === "owner_revoke_visitor_password") {
        const { error } = await admin.from("portfolio_visitor_passwords").update({ expires_at: new Date().toISOString() }).eq("id", String(body.id)).eq("owner_user_id", owner.id).is("used_at", null);
        if (error) throw error;
        return json({ ok: true });
      }
      const { data, error } = await admin.from("portfolio_access_logs").select("id,accessed_at,success,user_agent").order("accessed_at", { ascending: false }).limit(100);
      if (error) throw error;
      return json({ logs: (data ?? []).map((row) => ({ id: row.id, accessedAt: row.accessed_at, success: row.success, userAgent: row.user_agent ?? undefined })) });
    }
    if (body.action === "visitor_login") {
      const candidateHash = await hash(String(body.password ?? "").trim());
      const { data: consumed, error } = await admin.rpc("consume_visitor_password", { candidate_hash: candidateHash, visitor_user_agent: typeof body.userAgent === "string" ? body.userAgent : "unknown", visitor_ip_hash: ipHash });
      const consumedRows = Array.isArray(consumed) ? consumed : consumed ? [consumed] : [];
      const success = !error && consumedRows.length === 1;
      await admin.from("portfolio_access_logs").insert({ success, user_agent: typeof body.userAgent === "string" ? body.userAgent.slice(0, 500) : null, ip_hash: ipHash });
      if (!success) return json({ error: "Palavra-passe de visitante inválida, expirada ou já utilizada." }, 401);
      return json(await createToken(sessionSecret, "visitor"));
    }
    if (body.action === "list") {
      const owner = await ownerFromRequest(admin, request);
      const role = owner ? "owner" : await tokenRole(request, sessionSecret);
      if (!role) return json({ error: "Sessão de visitante inválida ou expirada." }, 401);
      const { data, error } = await admin.from("portfolio_items").select("*").eq("status", "published").order("order_index").order("updated_at", { ascending: false });
      if (error) throw error;
      return json({ items: await Promise.all((data ?? []).map((row) => itemToPublic(admin, row))) });
    }
    const role = await tokenRole(request, sessionSecret);
    if (!role) return json({ error: "Sessão de visitante inválida ou expirada." }, 401);
    if (body.action === "save" || body.action === "logs") return json({ error: "Esta operação está reservada ao proprietário." }, 403);
    return json({ error: "Acção desconhecida." }, 400);
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Erro interno." }, 500); }
});
