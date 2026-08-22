import { LoaderCircle } from "lucide-react";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";
import SupabaseLogin from "../pages/SupabaseLogin";

export default function PortfolioAccessGate({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useSupabaseAuth();

  if (!configured) return <SupabaseLogin />;
  if (loading) return <main className="grid min-h-screen place-items-center bg-[#17233e] text-white"><LoaderCircle className="h-8 w-8 animate-spin" aria-label="A verificar acesso" /></main>;
  if (!user) return <SupabaseLogin />;
  return <>{children}</>;
}
