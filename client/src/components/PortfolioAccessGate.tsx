import { useEffect, useState } from "react";
import { Link } from "wouter";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";
import { supabase } from "../lib/supabase";
import SupabaseLogin from "../pages/SupabaseLogin";

export default function PortfolioAccessGate({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useSupabaseAuth();
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [member, setMember] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || !supabase) {
      setMember(null);
      return;
    }
    let active = true;
    setCheckingMembership(true);
    supabase.from("portfolio_members").select("user_id, role").eq("user_id", user.id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      setMember(Boolean(data) && !error);
      setCheckingMembership(false);
    });
    return () => { active = false; };
  }, [user]);

  if (!configured) return <SupabaseLogin />;
  if (loading || (user && checkingMembership)) return <main className="grid min-h-screen place-items-center bg-[#17233e] text-white"><LoaderCircle className="h-8 w-8 animate-spin" aria-label="A verificar acesso" /></main>;
  if (!user) return <SupabaseLogin />;
  if (!member) return <main className="grid min-h-screen place-items-center bg-[#17233e] px-4 text-[#17233e]"><section className="max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"><LockKeyhole className="mx-auto h-10 w-10 text-[#17233e]" /><h1 className="display-font mt-4 text-2xl">Acesso não autorizado</h1><p className="mt-3 text-sm leading-6 text-[#6a7487]">A sua conta está autenticada, mas ainda não foi adicionada à lista de membros deste portefólio.</p><Link href="/login" className="mt-6 inline-flex rounded-xl bg-[#17233e] px-4 py-2 text-sm font-semibold text-white">Voltar ao login</Link></section></main>;
  return <>{children}</>;
}
