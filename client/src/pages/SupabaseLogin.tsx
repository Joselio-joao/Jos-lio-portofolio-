import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, KeyRound, LogIn, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";
import { isValidOtp, normalizeOtp, OTP_LENGTH } from "../lib/otp";

export default function SupabaseLogin() {
  const [, navigate] = useLocation();
  const { user, configured } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (user) navigate("/");
  }, [navigate, user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setMessage("O acesso Supabase ainda não está configurado neste deployment.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: false },
    });
    if (error) {
      setMessage("Não foi possível enviar o código. Confirme se este e-mail foi autorizado pelo proprietário.");
    } else {
      setEmail(normalizedEmail);
      setStep("code");
      setCooldown(60);
      setMessage("Enviámos um código temporário para o seu e-mail. O código é válido por pouco tempo.");
    }
    setBusy(false);
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setMessage("O acesso Supabase ainda não está configurado neste deployment.");
      return;
    }
    const normalizedCode = normalizeOtp(code);
    if (!isValidOtp(normalizedCode)) {
      setMessage("Introduza o código de 6 dígitos recebido por e-mail.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.verifyOtp({ email, token: normalizedCode, type: "email" });
    if (error) setMessage("O código é inválido ou expirou. Peça um novo código e tente novamente.");
    else navigate("/");
    setBusy(false);
  }

  async function resendCode() {
    if (cooldown > 0 || !supabase) return;
    await requestCode({ preventDefault: () => undefined } as FormEvent);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#17233e] px-4 py-10 text-[#17233e]">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef2f8] text-[#17233e]"><ShieldCheck className="h-6 w-6" /></span>
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#6a7487]">Acesso protegido</p><h1 className="display-font text-2xl">Portefólio privado</h1></div>
        </div>
        {!configured ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">O Supabase não está configurado neste deployment.</p> : step === "email" ? <form onSubmit={requestCode} className="space-y-4">
          <p className="text-sm leading-6 text-[#6a7487]">Introduza o seu e-mail autorizado. Enviaremos um código temporário, sem necessidade de palavra-passe.</p>
          <label className="block text-sm font-semibold">E-mail<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dbe3f0] px-3 outline-none focus:border-[#17233e]" /></label>
          {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
          <button disabled={busy} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#17233e] px-4 text-sm font-semibold text-white disabled:opacity-50"><Mail className="h-4 w-4" />{busy ? "A enviar…" : "Enviar código"}</button>
        </form> : <form onSubmit={verifyCode} className="space-y-4">
          <p className="text-sm leading-6 text-[#6a7487]">Introduza o código de 6 dígitos enviado para <strong>{email}</strong>.</p>
          <label className="block text-sm font-semibold">Código temporário<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" autoFocus required value={code} onChange={(event) => setCode(normalizeOtp(event.target.value))} className="mt-2 h-14 w-full rounded-xl border border-[#dbe3f0] px-3 text-center text-2xl tracking-[.35em] outline-none focus:border-[#17233e]" /></label>
          {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
          <button disabled={busy || code.length !== OTP_LENGTH} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#17233e] px-4 text-sm font-semibold text-white disabled:opacity-50"><KeyRound className="h-4 w-4" />{busy ? "A confirmar…" : "Confirmar código"}</button>
          <div className="flex items-center justify-between gap-3 text-xs"><button type="button" onClick={() => { setStep("email"); setCode(""); setMessage(""); }} className="inline-flex items-center gap-1 font-semibold text-[#17233e]"><ArrowLeft className="h-3.5 w-3.5" /> Alterar e-mail</button><button type="button" onClick={resendCode} disabled={cooldown > 0 || busy} className="font-semibold text-[#17233e] disabled:text-[#9aa5b8]">{cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}</button></div>
        </form>}
        <p className="mt-6 text-xs leading-5 text-[#6a7487]">Apenas utilizadores adicionados pelo proprietário em <code>portfolio_members</code> podem consultar o conteúdo.</p>
      </section>
    </main>
  );
}
