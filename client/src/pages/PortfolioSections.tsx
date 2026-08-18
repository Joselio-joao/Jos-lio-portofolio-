import { useMemo, useState } from "react";
import { Award, Building2, CalendarDays, FolderKanban, Hammer, Home, ArrowLeft, Search } from "lucide-react";
import { certificates, groups } from "./Home";
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
  const [groupId, setGroupId] = useState("all");
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const categories = ["Todos", ...Array.from(new Set(certificates.map((item) => item.category)))];
  const filtered = useMemo(() => certificates.filter((item) => (groupId === "all" || item.groupId === groupId) && (category === "Todos" || item.category === category) && `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase())), [groupId, category, search]);
  return <PortfolioShell title="Certificados" eyebrow="Arquivo profissional"><section className="mt-8 rounded-2xl border border-[#dbe3f0] bg-white p-3 shadow-sm"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar certificados…" className="h-10 w-full rounded-lg border border-[#dbe3f0] bg-[#f7f9fc] pl-10 text-sm" /></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1"><button onClick={() => setGroupId("all")} className={`h-10 w-10 shrink-0 rounded-full border text-[9px] font-bold ${groupId === "all" ? "border-primary bg-primary text-white" : "border-[#dbe3f0] bg-white text-muted-foreground"}`}>ALL</button>{groups.map((group) => <button key={group.id} onClick={() => setGroupId(group.id)} title={group.name} aria-label={`Filtrar por ${group.name}`} className={`h-10 w-10 shrink-0 overflow-hidden rounded-full border p-0.5 ${groupId === group.id ? "border-primary ring-2 ring-primary/20" : "border-[#dbe3f0]"}`}><img src={group.image} alt={group.name} className="h-full w-full rounded-full object-cover" /></button>)}</div><div className="mt-3 flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase ${category === item ? "bg-[#17233e] text-white" : "bg-[#edf2fa] text-muted-foreground"}`}>{item}</button>)}</div></section><div className="mt-5 grid gap-4">{filtered.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#203252] shadow-lg lg:grid lg:grid-cols-[220px_1fr]"><div className="min-h-[150px] bg-[#e8edfb]"><img src={item.image} alt={`Miniatura de ${item.title}`} className="h-full min-h-[150px] w-full object-cover" /></div><div className="p-4"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">{item.category}</p><h2 className="display-font mt-2 text-lg leading-tight text-white">{item.title}</h2><p className="mt-2 text-xs leading-5 text-[#cdd7e8]">{item.description}</p><iframe title={`Visualizador de ${item.title}`} src={`${item.pdf}#toolbar=0&navpanes=0`} className="mt-4 h-[170px] w-full rounded-xl bg-white" /></div></article>)}</div><p className="mt-5 text-xs text-muted-foreground">{filtered.length} documentos apresentados</p></PortfolioShell>;
}

export function InstitutionsPage() {
  const groups = [{ name: "Eiffel", image: "./assets/liceu-eiffel-dande.png" }, { name: "UniAthena", image: "./assets/uniathena.png" }, { name: "Cambridge International Qualifications", image: "./assets/ciq.jpg" }, { name: "EF SET", image: "./assets/ef-set.png" }];
  return <PortfolioShell title="Instituições" eyebrow="Percurso académico"><div className="mt-8 grid gap-3 sm:grid-cols-2">{groups.map((group) => <article key={group.name} className="flex items-center gap-4 rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-sm"><img src={group.image} alt={group.name} className="h-16 w-16 rounded-xl object-cover" /><div><h2 className="font-semibold text-[#17233e]">{group.name}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Instituição associada ao percurso e aos documentos apresentados.</p></div></article>)}</div></PortfolioShell>;
}
