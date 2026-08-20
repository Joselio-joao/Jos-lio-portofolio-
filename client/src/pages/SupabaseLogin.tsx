import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LogIn, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";

export default function SupabaseLogin() {
  const [, navigate] = useLocation();
  const { user, configured } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [navigate, user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setMessage("O acesso Supabase ainda não está configurado neste deployment.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setMessage("Não foi possível iniciar sessão. Confirme o e-mail e a palavra-passe.");
    else navigate("/");
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#17233e] px-4 py-10 text-[#17233e]">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef2f8] text-[#17233e]"><ShieldCheck className="h-6 w-6" /></span>
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#6a7487]">Acesso protegido</p><h1 className="display-font text-2xl">Portefólio privado</h1></div>
        </div>
        {!configured ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">O Supabase não está configurado neste deployment.</p> : <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-semibold">E-mail<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dbe3f0] px-3 outline-none focus:border-[#17233e]" /></label>
          <label className="block text-sm font-semibold">Palavra-passe<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dbe3f0] px-3 outline-none focus:border-[#17233e]" /></label>
          {message && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}
          <button disabled={busy} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#17233e] px-4 text-sm font-semibold text-white disabled:opacity-50"><LogIn className="h-4 w-4" />{busy ? "A entrar…" : "Entrar"}</button>
        </form>}
        <p className="mt-6 text-xs leading-5 text-[#6a7487]">Apenas utilizadores adicionados pelo proprietário em <code>portfolio_members</code> podem consultar o conteúdo.</p>
      </section>
    </main>
  );
}
