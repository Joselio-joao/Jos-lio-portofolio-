import { FormEvent, useEffect, useState } from "react";
import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";
import { signInWithOwnerPassword, signInWithVisitorPassword } from "../lib/portfolioProxy";

function accessErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const normalized = raw.toLowerCase();
  if (normalized.includes("load failed") || normalized.includes("failed to fetch") || normalized.includes("networkerror")) {
    return navigator.onLine
      ? "Não foi possível ligar ao serviço de acesso. Verifique a ligação e tente novamente."
      : "O dispositivo está sem ligação à internet. Ligue-se à internet e tente novamente.";
  }
  if (normalized.includes("invalid login credentials") || normalized.includes("invalid_credentials")) return "E-mail ou palavra-passe do proprietário inválidos.";
  if (normalized.includes("email not confirmed")) return "Confirme primeiro o e-mail da conta do proprietário.";
  return raw || fallback;
}

export default function SupabaseLogin() {
  const { user, configured } = useSupabaseAuth();
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [visitorPassword, setVisitorPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"owner" | "visitor" | null>(null);

  useEffect(() => { if (user) window.location.assign("/"); }, [user]);

  async function ownerLogin(event: FormEvent) {
    event.preventDefault();
    if (!configured) { setMessage("O acesso ainda não está configurado neste deployment."); return; }
    setBusy("owner"); setMessage("");
    try { await signInWithOwnerPassword(ownerEmail, ownerPassword); window.location.assign("/"); }
    catch (error) { setMessage(accessErrorMessage(error, "E-mail ou palavra-passe inválidos.")); setBusy(null); }
  }

  async function visitorLogin(event: FormEvent) {
    event.preventDefault();
    if (!visitorPassword) { setMessage("Introduza a palavra-passe de visitante."); return; }
    setBusy("visitor"); setMessage("");
    try { await signInWithVisitorPassword(visitorPassword); window.location.assign("/"); }
    catch (error) { setMessage(accessErrorMessage(error, "Palavra-passe de visitante inválida ou já utilizada.")); setBusy(null); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#17233e] px-4 py-10 text-[#17233e]"><section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-7 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef2f8] text-[#17233e]"><ShieldCheck className="h-6 w-6" /></span><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#6a7487]">Acesso protegido</p><h1 className="display-font text-2xl">Portefólio privado</h1></div></div>{!configured ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">O acesso protegido não está configurado neste deployment.</p> : <div className="space-y-5"><form onSubmit={ownerLogin} className="rounded-2xl border border-[#dbe3f0] p-4"><div className="mb-3 flex items-center gap-2"><UserRound className="h-4 w-4 text-[#17233e]" /><h2 className="text-sm font-semibold">Proprietário</h2></div><p className="mb-4 text-xs leading-5 text-[#6a7487]">Use o seu e-mail e palavra-passe para entrar na Gestão e gerar acessos de visitante.</p><label className="block text-xs font-semibold">E-mail<input type="email" required autoComplete="username" value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dbe3f0] px-3 outline-none focus:border-[#17233e]" /></label><label className="mt-3 block text-xs font-semibold">Palavra-passe<input type="password" required autoComplete="current-password" value={ownerPassword} onChange={(event) => setOwnerPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dbe3f0] px-3 outline-none focus:border-[#17233e]" /></label><button type="submit" disabled={busy !== null} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#17233e] px-4 text-xs font-semibold text-white disabled:opacity-50"><UserRound className="h-4 w-4" />{busy === "owner" ? "A verificar…" : "Entrar como proprietário"}</button></form><form onSubmit={visitorLogin} className="rounded-2xl border border-[#dbe3f0] bg-[#f7f9fc] p-4"><div className="mb-3 flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#17233e]" /><h2 className="text-sm font-semibold">Visitante</h2></div><p className="mb-4 text-xs leading-5 text-[#6a7487]">Use a palavra-passe fornecida pelo proprietário. Ela só pode ser utilizada uma vez.</p><label className="block text-xs font-semibold">Palavra-passe de visitante<input type="password" required autoComplete="one-time-code" value={visitorPassword} onChange={(event) => setVisitorPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dbe3f0] bg-white px-3 outline-none focus:border-[#17233e]" /></label><button type="submit" disabled={busy !== null} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#17233e] px-4 text-xs font-semibold text-[#17233e] disabled:opacity-50"><KeyRound className="h-4 w-4" />{busy === "visitor" ? "A verificar…" : "Entrar como visitante"}</button></form>{message && <p role="alert" aria-live="assertive" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}</div>}<p className="mt-6 text-xs leading-5 text-[#6a7487]">As sessões expiram automaticamente. As palavras-passe não são guardadas no navegador.</p></section></main>;
}
