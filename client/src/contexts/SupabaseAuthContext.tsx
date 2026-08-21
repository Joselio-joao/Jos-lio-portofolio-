import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { clearPortfolioProxySession, hasPortfolioProxySession } from "../lib/portfolioProxy";

type AuthContextValue = {
  session: Session | { access_token: string } | null;
  user: User | { id: string; email: string } | null;
  role: "owner" | "viewer" | null;
  isOwner: boolean;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<AuthContextValue | null>(null);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [proxyActive, setProxyActive] = useState(false);
  const [role, setRole] = useState<"owner" | "viewer" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const proxySession = hasPortfolioProxySession();
    setProxyActive(proxySession);
    if (!supabase) {
      setRole(proxySession ? "viewer" : null);
      setLoading(false);
      return;
    }
    let active = true;
    const client = supabase;
    if (!client) { setRole(proxySession ? "viewer" : null); setLoading(false); return; }
    const refreshMembership = async (next: Session | null) => {
      if (!next) {
        if (active) { setRole(null); setLoading(false); }
        return;
      }
      const { data } = await client.from("portfolio_members").select("role").eq("user_id", next.user.id).maybeSingle();
      if (active) { setRole(data?.role === "owner" ? "owner" : "viewer"); setLoading(false); }
    };
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (!data.session && proxySession) setRole("viewer");
      void refreshMembership(data.session);
    });
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void refreshMembership(nextSession);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const isOwner = Boolean(session && role === "owner");
  const user = session?.user ?? (proxyActive ? { id: "visitor", email: "visitante" } : null);
  const value = useMemo<AuthContextValue>(() => ({
    session: session ?? (proxyActive ? { access_token: "portfolio-proxy-session" } : null),
    user,
    role: session ? role : (proxyActive ? "viewer" : null),
    isOwner,
    loading,
    configured: isSupabaseConfigured,
    signOut: async () => {
      clearPortfolioProxySession();
      if (supabase) await supabase.auth.signOut();
      setProxyActive(false);
      setSession(null);
      setRole(null);
      window.location.assign("/login");
    },
  }), [isOwner, loading, proxyActive, role, session, user]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) throw new Error("useSupabaseAuth deve ser utilizado dentro de SupabaseAuthProvider.");
  return context;
}
