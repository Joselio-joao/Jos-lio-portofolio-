import { useEffect, useMemo, useState } from "react";
import { Award, Building2, CalendarDays, ExternalLink, FileText, FolderKanban, Hammer, Home, Search, Linkedin, Video } from "lucide-react";
import { certificates, groups } from "./portfolioData";
import { loadPortfolioContent, type PortfolioItem } from "../lib/portfolioContent";
import { institutionImage } from "../lib/institutionAssets";
import { Link, useLocation } from "wouter";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const LINKEDIN = "https://www.linkedin.com/in/josélio-joão-b02776424";
const customCertificateImage = (item: PortfolioItem) => item.image || (item.category === "EF SET" ? `${base}/assets/ef-set.png` : item.category === "UniAthena" ? `${base}/assets/uniathena.png` : `${base}/assets/ciq.jpg`);

function AttachmentCard({ attachment }: { attachment?: PortfolioItem["attachment"] }) {
  if (!attachment) return null;
  if (attachment.type === "video") return <div className="mt-4 overflow-hidden rounded-xl bg-black"><video controls preload="metadata" className="max-h-72 w-full" src={attachment.url}><track kind="captions" /></video><p className="flex items-center gap-2 px-3 py-2 text-[10px] text-white"><Video className="h-3.5 w-3.5" />{attachment.name}</p></div>;
  return <a href={attachment.url} target="_blank" rel="noreferrer" download={attachment.name} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-semibold text-white"><FileText className="h-3.5 w-3.5" />Abrir {attachment.name}</a>;
}
export const navItems = [
  { href: `${base}/`, label: "Perfil", icon: Home },
  { href: `${base}/projectos`, label: "Projectos", icon: FolderKanban },
  { href: `${base}/eventos`, label: "Eventos", icon: CalendarDays },
  { href: `${base}/obras`, label: "Obras", icon: Hammer },
  { href: `${base}/certificados`, label: "Certificados", icon: Award },
  { href: `${base}/instituicoes`, label: "Instituições", icon: Building2 },
];

export function PortfolioShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return <div className="min-h-screen bg-[#f7f9fc] pb-24 text-[#17233e]">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#17233e]/95 backdrop-blur-xl"><div className="container flex h-16 items-center justify-between"><div className="flex items-center gap-3"><img src={`${base}/assets/logo.png`} alt="Símbolo de Josélio João" className="h-10 w-10 rounded-full object-contain" /><span className="hidden text-sm font-semibold tracking-[.08em] text-white sm:block">JOSÉLIO <span className="text-primary">JOÃO</span></span></div><a href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="Abrir LinkedIn" className="rounded-full border border-white/10 p-2.5 text-white hover:border-primary hover:text-primary"><Linkedin className="h-4 w-4" /></a></div></header>
    <main className="container py-10 sm:py-14"><p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">{eyebrow}</p><h1 className="display-font mt-3 text-4xl text-[#101a31] sm:text-5xl">{title}</h1>{children}</main>
    <BottomNav />
  </div>;
}

export function BottomNav() {
  const [location, navigate] = useLocation();
  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    if (location === href || (href === `${base}/` && location === base)) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }
    navigate(href);
  };
  return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dbe3f0] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(23,35,62,.08)] backdrop-blur-xl" aria-label="Navegação principal"><div className="mx-auto grid max-w-3xl grid-cols-6 gap-0">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={(event) => goTo(event, href)} className="flex min-w-0 min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-0 py-2.5 text-center text-[9px] font-semibold leading-3 text-[#65718a] whitespace-normal break-words transition active:scale-[.98] hover:bg-[#f0edff] hover:text-[#6c5ce7] sm:gap-1 sm:px-1.5 sm:text-xs sm:leading-tight"><Icon className="h-5 w-5 shrink-0" />{label}</Link>)}</div></nav>;
}

function normalizedKind(value: unknown): string {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[ _-]+/g, "");
}

function itemsForKind(items: PortfolioItem[], kind: string): PortfolioItem[] {
  const wanted = normalizedKind(kind);
  return items.filter((item) => normalizedKind(item.kind) === wanted || normalizedKind(item.category) === wanted);
}

export function PlaceholderPage({ title, eyebrow, icon: Icon, description, kind }: { title: string; eyebrow: string; icon: typeof FolderKanban; description: string; kind: "projectos" | "eventos" | "obras" }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  useEffect(() => { loadPortfolioContent().then((stored) => setItems(itemsForKind(stored, kind))).catch(() => setItems([])); }, [kind]);
  return <PortfolioShell title={title} eyebrow={eyebrow}><section className="mt-8 max-w-3xl rounded-2xl border border-[#dbe3f0] bg-white p-6 shadow-sm sm:p-8"><Icon className="h-8 w-8 text-primary" /><p className="mt-5 text-base leading-7 text-muted-foreground">{description}</p>{items.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Ainda não existem conteúdos adicionados nesta página.</p> : <div className="mt-6 grid gap-3 sm:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-xl border border-[#dbe3f0] p-4">{item.image && <img src={item.image} alt="" className="mb-3 h-32 w-full rounded-lg object-cover" />}<h2 className="font-semibold">{item.title}</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p><AttachmentCard attachment={item.attachment} />{item.externalUrl && <a href={item.externalUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#17233e] px-3 py-2 text-xs font-semibold text-white">Abrir ligação <ExternalLink className="h-3.5 w-3.5" /></a>}</article>)}</div>}</section></PortfolioShell>;
}

export function CertificatesPage() {
  const [customItems, setCustomItems] = useState<PortfolioItem[]>([]);
  const [openPdfId, setOpenPdfId] = useState<string | null>(null);
  useEffect(() => { loadPortfolioContent().then((stored) => setCustomItems(itemsForKind(stored, "certificados"))).catch(() => setCustomItems([])); }, []);
  const allCertificates = useMemo(() => [...certificates.map((item) => ({ ...item, attachment: undefined, externalUrl: item.pdf })), ...customItems.map((item) => ({ id: item.id, title: item.title, category: item.category || "Certificate", groupId: "custom", description: item.description, image: customCertificateImage(item), pdf: item.pdf || "", attachment: item.attachment, externalUrl: item.externalUrl || item.pdf || "" }))], [customItems]);
  const [groupId, setGroupId] = useState("all");
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const categories = ["Todos", ...Array.from(new Set(allCertificates.map((item) => item.category)))];
  const filtered = useMemo(() => allCertificates.filter((item) => (groupId === "all" || item.groupId === groupId) && (category === "Todos" || item.category === category) && `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase())), [allCertificates, groupId, category, search]);
  return <PortfolioShell title="Certificados" eyebrow="Arquivo profissional"><section className="mt-8 rounded-2xl border border-[#dbe3f0] bg-white p-3 shadow-sm"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar certificados…" className="h-10 w-full rounded-lg border border-[#dbe3f0] bg-[#f7f9fc] pl-10 text-sm" /></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1"><button onClick={() => setGroupId("all")} className={`h-10 w-10 shrink-0 rounded-full border text-[9px] font-bold ${groupId === "all" ? "border-primary bg-primary text-white" : "border-[#dbe3f0] bg-white text-muted-foreground"}`}>ALL</button>{groups.map((group) => <button key={group.id} onClick={() => setGroupId(group.id)} title={group.name} aria-label={`Filtrar por ${group.name}`} className={`h-10 w-10 shrink-0 overflow-hidden rounded-full border p-0.5 ${groupId === group.id ? "border-primary ring-2 ring-primary/20" : "border-[#dbe3f0]"}`}><img src={group.image} alt={group.name} className="h-full w-full rounded-full bg-[#f7f9fc] object-contain" /></button>)}</div><div className="mt-3 flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase ${category === item ? "bg-[#17233e] text-white" : "bg-[#edf2fa] text-muted-foreground"}`}>{item}</button>)}</div></section><div className="mt-4 grid gap-3">{filtered.map((item) => <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#203252] shadow-md lg:grid lg:grid-cols-[180px_1fr]"><div className="flex w-24 shrink-0 items-center justify-center bg-[#e8edfb] p-2 sm:w-28 lg:w-[150px]"><img src={item.image} alt={`Miniatura de ${item.title}`} className="h-16 w-16 rounded-lg bg-[#f7f9fc] object-contain sm:h-20 sm:w-20 lg:h-24 lg:w-24" /></div><div className="min-w-0 flex-1 p-3"><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-primary">{item.category}</p><h2 className="display-font mt-1.5 text-base leading-tight text-white">{item.title}</h2><p className="mt-1.5 text-[11px] leading-4 text-[#cdd7e8]">{item.description}</p>{item.pdf ? <div className="mt-3"><button type="button" onClick={() => setOpenPdfId(openPdfId === item.id ? null : item.id)} className="inline-flex min-h-9 items-center rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#17233e] transition-transform active:scale-[.97]">{openPdfId === item.id ? "Fechar pré-visualização" : "Ver PDF aqui"}</button>{openPdfId === item.id && <iframe title={`Visualizador de ${item.title}`} src={`${item.pdf}#toolbar=0&navpanes=0`} loading="lazy" className="mt-2 h-[140px] w-full rounded-lg bg-white" />}</div> : <p className="mt-3 rounded-lg bg-white/10 p-3 text-[11px] leading-4 text-[#cdd7e8]">PDF ainda não associado.</p>}<AttachmentCard attachment={item.attachment} />{item.externalUrl && <a href={item.externalUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-2.5 py-1.5 text-[11px] font-semibold text-white">Abrir documento <ExternalLink className="h-3.5 w-3.5" /></a>}</div></article>)}</div><p className="mt-5 text-xs text-muted-foreground">{filtered.length} documentos apresentados</p></PortfolioShell>;
}

export function InstitutionsPage() {
  const [customItems, setCustomItems] = useState<PortfolioItem[]>([]);
  useEffect(() => { loadPortfolioContent().then((stored) => setCustomItems(itemsForKind(stored, "instituicoes"))).catch(() => setCustomItems([])); }, []);
  const allGroups = [...groups.map((group) => ({ ...group, externalUrl: undefined })), ...customItems.map((item) => ({ id: item.id, name: item.title, description: item.description, image: institutionImage(item.title, item.image), externalUrl: item.externalUrl }))];
  return <PortfolioShell title="Instituições" eyebrow="Percurso académico"><div className="mt-8 grid gap-3 sm:grid-cols-2">{allGroups.map((group) => <article key={group.id} className="flex items-center gap-4 rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-sm"><img src={group.image} alt={group.name} className="h-16 w-16 rounded-xl bg-[#f7f9fc] object-contain" /><div><h2 className="font-semibold text-[#17233e]">{group.name}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{group.description}</p>{group.externalUrl && <a href={group.externalUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">Abrir ligação <ExternalLink className="h-3.5 w-3.5" /></a>}</div></article>)}</div></PortfolioShell>;
}
