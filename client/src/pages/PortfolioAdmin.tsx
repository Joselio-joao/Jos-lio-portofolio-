import { useEffect, useState } from "react";
import { Download, Pencil, Trash2, Github } from "lucide-react";
import { loadPortfolioContent, savePortfolioContent, exportPortfolioContent, readFileAsDataUrl, type PortfolioItem, type PortfolioKind } from "../lib/portfolioContent";

const kinds: { value: PortfolioKind; label: string }[] = [
  { value: "projectos", label: "Projectos" },
  { value: "eventos", label: "Eventos" },
  { value: "obras", label: "Obras" },
  { value: "certificados", label: "Certificados" },
  { value: "instituicoes", label: "Instituições" },
];
const emptyForm = { kind: "projectos" as PortfolioKind, title: "", description: "", category: "" };

export default function PortfolioAdmin() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState("");
  const [pdf, setPdf] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("A carregar conteúdos publicados…");

  useEffect(() => { loadPortfolioContent().then((stored) => { setItems(stored); setMessage(`${stored.length} conteúdos publicados no GitHub.`); }).catch(() => setMessage("Não foi possível carregar os conteúdos publicados.")); }, []);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    try { setter(await readFileAsDataUrl(file)); } catch { setMessage("Não foi possível ler o ficheiro selecionado."); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    const item: PortfolioItem = { ...form, id: editingId ?? crypto.randomUUID(), image: image || undefined, pdf: pdf || undefined, updatedAt: Date.now() };
    const next = editingId ? items.map((current) => current.id === editingId ? item : current) : [item, ...items];
    try { const published = await savePortfolioContent(next, token); setItems(published); setForm(emptyForm); setImage(""); setPdf(""); setEditingId(null); setMessage("Conteúdo e ficheiros publicados no GitHub. O site será atualizado automaticamente."); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível publicar o conteúdo."); }
  }

  function edit(item: PortfolioItem) { setEditingId(item.id); setForm({ kind: item.kind, title: item.title, description: item.description, category: item.category ?? "" }); setImage(item.image ?? ""); setPdf(item.pdf ?? ""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function remove(id: string) { const next = items.filter((item) => item.id !== id); try { const published = await savePortfolioContent(next, token); setItems(published); setMessage("Conteúdo removido e publicado no GitHub."); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível remover o conteúdo."); } }
  function reset() { setEditingId(null); setForm(emptyForm); setImage(""); setPdf(""); }

  return <div className="min-h-screen bg-[#f7f9fc] pb-12 text-[#17233e]"><header className="bg-[#17233e] text-white"><div className="container flex min-h-16 items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">Gestão GitHub</p><h1 className="display-font mt-1 text-2xl">Gerir portefólio</h1></div><a href="/Jos-lio-portofolio-/" className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold">Ver Perfil</a></div></header><main className="container py-8"><section className="rounded-2xl border border-[#dbe3f0] bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm leading-6 text-muted-foreground">Adicione e edite conteúdos que ficam guardados no repositório GitHub e aparecem para todos os visitantes após a publicação.</p><p className="mt-2 text-xs text-muted-foreground">{message}</p></div><button type="button" onClick={() => exportPortfolioContent(items)} className="inline-flex items-center gap-2 rounded-full border border-[#dbe3f0] px-4 py-2 text-xs font-semibold"><Download className="h-4 w-4" /> Exportar</button></div><label className="mt-5 block rounded-xl border border-[#dbe3f0] bg-[#f7f9fc] p-4 text-xs font-semibold">Token GitHub com permissão <em>Contents: Read and write</em><input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Cole o token apenas nesta sessão" autoComplete="off" className="mt-2 h-10 w-full rounded-lg border border-[#dbe3f0] bg-white px-3 text-sm" /><span className="mt-2 block text-[10px] font-normal text-muted-foreground">O token não é guardado no navegador nem enviado para outro serviço; é usado apenas para publicar neste repositório.</span></label><form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Área<select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as PortfolioKind })} className="mt-2 h-10 w-full rounded-lg border border-[#dbe3f0] bg-white px-3 text-sm">{kinds.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}</select></label><label className="text-xs font-semibold">Categoria<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Ex.: Académico" className="mt-2 h-10 w-full rounded-lg border border-[#dbe3f0] px-3 text-sm" /></label><label className="text-xs font-semibold sm:col-span-2">Título<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Título do conteúdo" className="mt-2 h-10 w-full rounded-lg border border-[#dbe3f0] px-3 text-sm" /></label><label className="text-xs font-semibold sm:col-span-2">Descrição<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} placeholder="Explique este conteúdo…" className="mt-2 w-full rounded-lg border border-[#dbe3f0] px-3 py-2 text-sm" /></label><label className="text-xs font-semibold">Imagem<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => handleFile(event, setImage)} className="mt-2 block w-full text-xs" />{image && <span className="mt-1 block text-[10px] text-primary">Imagem selecionada</span>}</label><label className="text-xs font-semibold">PDF opcional<input type="file" accept="application/pdf" onChange={(event) => handleFile(event, setPdf)} className="mt-2 block w-full text-xs" />{pdf && <span className="mt-1 block text-[10px] text-primary">PDF selecionado</span>}</label><div className="flex flex-wrap gap-2 sm:col-span-2"><button className="inline-flex items-center gap-2 rounded-full bg-[#17233e] px-5 py-2.5 text-xs font-semibold text-white"><Github className="h-4 w-4" /> {editingId ? "Atualizar no GitHub" : "Publicar no GitHub"}</button>{editingId && <button type="button" onClick={reset} className="rounded-full border border-[#dbe3f0] px-5 py-2.5 text-xs font-semibold">Cancelar edição</button>}</div></form></section><section className="mt-6 grid gap-3">{items.length === 0 ? <div className="rounded-2xl border border-dashed border-[#b9c7db] p-8 text-center text-sm text-muted-foreground">Ainda não existem conteúdos publicados no GitHub.</div> : items.map((item) => <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">{kinds.find((kind) => kind.value === item.kind)?.label} {item.category && `· ${item.category}`}</p><h2 className="mt-1 font-semibold">{item.title}</h2><p className="mt-1 text-xs text-muted-foreground">{item.description}</p><p className="mt-2 text-[10px] text-muted-foreground">{item.image ? "Imagem" : "Sem imagem"} · {item.pdf ? "PDF" : "Sem PDF"}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => edit(item)} aria-label={`Editar ${item.title}`} className="rounded-full border border-[#dbe3f0] p-2"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => remove(item.id)} aria-label={`Remover ${item.title}`} className="rounded-full border border-red-200 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div></article>)}</section></main></div>;
}
