import { ArrowUpRight, Award, Building2, CalendarDays, FolderKanban, Hammer, Linkedin, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";

const LINKEDIN = "https://www.linkedin.com/in/josélio-joão-b02776424";
const BASE = "";

const navItems = [
  { href: `${BASE}/`, label: "Perfil", icon: UserRound },
  { href: `${BASE}/projectos`, label: "Projectos", icon: FolderKanban },
  { href: `${BASE}/eventos`, label: "Eventos", icon: CalendarDays },
  { href: `${BASE}/obras`, label: "Obras", icon: Hammer },
  { href: `${BASE}/certificados`, label: "Certificados", icon: Award },
  { href: `${BASE}/instituicoes`, label: "Instituições", icon: Building2 },
];

function BottomNav() {
  const [location, navigate] = useLocation();
  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    if (location === href || (href === `${BASE}/` && location === BASE)) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }
    navigate(href);
  };
  return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dbe3f0] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(23,35,62,.08)] backdrop-blur-xl" aria-label="Navegação principal"><div className="mx-auto grid max-w-3xl grid-cols-6 gap-1">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={(event) => goTo(event, href)} aria-current={label === "Perfil" ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2.5 text-[10px] font-semibold leading-tight transition active:scale-[.98] sm:text-xs ${label === "Perfil" ? "bg-[#17233e] text-white" : "text-[#65718a] hover:bg-[#f0edff] hover:text-[#6c5ce7]"}`}><Icon className="h-5 w-5" />{label}</Link>)}</div></nav>;
}

export default function Home() {
  return <div className="min-h-screen bg-[#f7f9fc] pb-24 text-[#17233e]"><header className="border-b border-white/10 bg-[#17233e]" aria-label="Identidade"><div className="container flex h-16 items-center justify-between"><span className="text-sm font-semibold tracking-[.12em] text-white">JOSÉLIO <span className="text-primary">JOÃO</span></span><a href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="Abrir LinkedIn" className="rounded-full border border-white/15 p-2.5 text-white hover:border-primary hover:text-primary"><Linkedin className="h-4 w-4" /></a></div></header><main className="container max-w-4xl py-14 sm:py-20"><section aria-labelledby="apresentacao"><p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">Apresentação pessoal</p><h1 id="apresentacao" className="display-font mt-4 max-w-3xl text-4xl leading-tight text-[#101a31] sm:text-6xl">Bom dia a todos.</h1><div className="mt-8 max-w-3xl space-y-5 text-base leading-8 text-muted-foreground sm:text-lg"><p>Chamo-me <strong className="text-[#101a31]">Josélio Guilherme da Costa João</strong>. Sou estudante e inventor, e estou aqui para apresentar o meu portefólio.</p><p>Este espaço mostra a minha jornada de aprendizagem, as experiências que vou construindo e o percurso que tem contribuído para o meu desenvolvimento pessoal e académico.</p><p>Actualmente estudo no <strong className="text-[#101a31]">Liceu nº 1002 BGO Eiffel–Dande</strong>. Através das páginas inferiores, pode conhecer as áreas que fazem parte do meu percurso: projectos, eventos, obras, certificados e instituições.</p></div><div className="mt-12 grid max-w-2xl gap-4 border-t border-[#dbe3f0] pt-6 sm:grid-cols-3"><div><p className="display-font text-3xl text-[#101a31]">01</p><p className="mt-1 text-xs uppercase tracking-[.14em] text-muted-foreground">Estudante</p></div><div><p className="display-font text-3xl text-[#101a31]">02</p><p className="mt-1 text-xs uppercase tracking-[.14em] text-muted-foreground">Inventor</p></div><div><p className="display-font text-3xl text-[#101a31]">∞</p><p className="mt-1 text-xs uppercase tracking-[.14em] text-muted-foreground">Aprendizagem</p></div></div><a href={LINKEDIN} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center rounded-full bg-[#17233e] px-5 py-3 text-sm font-semibold text-white">LinkedIn <ArrowUpRight className="ml-2 h-4 w-4" /></a></section></main><BottomNav /></div>;
}
