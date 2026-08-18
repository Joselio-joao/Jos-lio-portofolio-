import { Award, Building2, CalendarDays, FolderKanban, Hammer, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const base = "/Jos-lio-portofolio-";
export const navItems = [
  { href: `${base}/`, label: "Perfil", icon: Home },
  { href: `${base}/projectos`, label: "Projectos", icon: FolderKanban },
  { href: `${base}/eventos`, label: "Eventos", icon: CalendarDays },
  { href: `${base}/obras`, label: "Obras", icon: Hammer },
  { href: `${base}/certificados`, label: "Certificados", icon: Award },
  { href: `${base}/instituicoes`, label: "Instituições", icon: Building2 },
];

export function PortfolioShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f7f9fc] pb-24 text-[#17233e]">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#17233e]/95 backdrop-blur-xl"><div className="container flex h-16 items-center justify-between"><Link href={`${base}/`} className="flex items-center gap-3"><img src="./assets/logo.png" alt="Símbolo de Josélio João" className="h-10 w-10 rounded-full object-contain" /><span className="hidden text-sm font-semibold tracking-[.08em] text-white sm:block">JOSÉLIO <span className="text-primary">JOÃO</span></span></Link><Link href={`${base}/`} className="inline-flex items-center gap-2 text-xs font-semibold text-white"><ArrowLeft className="h-4 w-4" /> Perfil</Link></div></header>
    <main className="container py-10 sm:py-14"><p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">{eyebrow}</p><h1 className="display-font mt-3 text-4xl text-[#101a31] sm:text-5xl">{title}</h1>{children}</main>
    <BottomNav />
  </div>;
}

export function BottomNav() {
  return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dbe3f0] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(23,35,62,.08)] backdrop-blur-xl" aria-label="Navegação principal"><div className="mx-auto grid max-w-3xl grid-cols-6 gap-1">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[9px] font-semibold text-[#65718a] transition hover:bg-[#f0edff] hover:text-[#6c5ce7]"><Icon className="h-4 w-4" />{label}</Link>)}</div></nav>;
}

export function PlaceholderPage({ title, eyebrow, icon: Icon, description }: { title: string; eyebrow: string; icon: typeof FolderKanban; description: string }) {
  return <PortfolioShell title={title} eyebrow={eyebrow}><section className="mt-8 max-w-2xl rounded-2xl border border-[#dbe3f0] bg-white p-6 shadow-sm sm:p-8"><Icon className="h-8 w-8 text-primary" /><p className="mt-5 text-base leading-7 text-muted-foreground">{description}</p><p className="mt-4 text-sm text-muted-foreground">Esta página está preparada para receber novos conteúdos sem alterar a estrutura do portefólio.</p></section></PortfolioShell>;
}

export function CertificatesPage() {
  return <PortfolioShell title="Certificados" eyebrow="Arquivo profissional"><section className="mt-8 rounded-2xl border border-[#dbe3f0] bg-white p-5 shadow-sm"><p className="text-sm leading-6 text-muted-foreground">A galeria documental continua disponível na página principal. Esta página própria organiza o acesso aos certificados por categoria e instituição.</p><Link href={`${base}/`} className="mt-5 inline-flex rounded-full bg-[#17233e] px-4 py-2 text-xs font-semibold text-white">Abrir galeria completa</Link></section></PortfolioShell>;
}

export function InstitutionsPage() {
  const groups = [{ name: "Eiffel", image: "./assets/liceu-eiffel-dande.png" }, { name: "UniAthena", image: "./assets/uniathena.png" }, { name: "Cambridge International Qualifications", image: "./assets/ciq.jpg" }, { name: "EF SET", image: "./assets/ef-set.png" }];
  return <PortfolioShell title="Instituições" eyebrow="Percurso académico"><div className="mt-8 grid gap-3 sm:grid-cols-2">{groups.map((group) => <article key={group.name} className="flex items-center gap-4 rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-sm"><img src={group.image} alt={group.name} className="h-16 w-16 rounded-xl object-cover" /><div><h2 className="font-semibold text-[#17233e]">{group.name}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Instituição associada ao percurso e aos documentos apresentados.</p></div></article>)}</div></PortfolioShell>;
}
