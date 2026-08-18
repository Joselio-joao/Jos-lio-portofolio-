// Design direction: Caderno de Missão Académica — editorial, focado em próximas ações e otimizado para cartões no telemóvel.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Compass,
  Download,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Sparkles,
  Target,
  TimerReset,
  Trash2,
  Trophy,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clearTrackerSection, confirmDestructiveAction } from "@/lib/trackerData";
import { estimateStorage, loadLargeFileMetadata, loadTrackerData, removeLargeFile, saveLargeFile, saveLargeFileMetadata, saveTrackerData, type StorageEstimate, type StoredFileMetadata } from "@/lib/offlineStorage";

const logoUrl = "./assets/super-tracker-logo.png";
const heroUrl = "./assets/academic-desk-hero.jpg";
const orbitUrl = "./assets/study-orbit-illustration.png";

const subjects = [
  "Língua Portuguesa",
  "Química",
  "Matemática",
  "Informática",
  "Biologia",
  "Geometria Descritiva",
  "Física",
  "Geologia",
  "Francês",
  "Empreendedorismo",
  "Inglês",
] as const;

type View = "painel" | "estudo" | "universidade" | "bolsas" | "mais";
type StudySession = { id: string; date: string; subject: string; minutes: number; topic: string; quality: number };
type Assessment = { id: string; date: string; subject: string; type: string; score: number; total: number };
type UniversityTask = { id: string; title: string; area: string; due: string; done: boolean; priority: "Alta" | "Média" | "Baixa" };
type Scholarship = { id: string; name: string; country: string; category: string; source: string; status: "Monitorizar" | "Em preparação" | "Candidatura enviada"; note: string };
type Habits = Record<string, Record<string, boolean>>;
type TrackerData = { sessions: StudySession[]; assessments: Assessment[]; universityTasks: UniversityTask[]; scholarships: Scholarship[]; habits: Habits };

const today = new Date().toISOString().slice(0, 10);

const defaultData: TrackerData = {
  sessions: [],
  assessments: [],
  universityTasks: [
    { id: "u1", title: "Definir 5 cursos-alvo em Engenharia/Tecnologia", area: "Estratégia", due: "2026-09-15", done: false, priority: "Alta" },
    { id: "u2", title: "Criar plano de Inglês rumo ao B2", area: "Idiomas", due: "2027-07-31", done: false, priority: "Alta" },
    { id: "u3", title: "Garantir passaporte válido", area: "Documentos", due: "2026-11-30", done: false, priority: "Alta" },
    { id: "u4", title: "Montar currículo académico", area: "Perfil", due: "2026-10-31", done: false, priority: "Média" },
    { id: "u5", title: "Preparar carta de motivação-base", area: "Perfil", due: "2026-12-15", done: false, priority: "Alta" },
    { id: "u6", title: "Pesquisar novas bolsas de forma contínua", area: "Bolsas", due: "2027-07-31", done: false, priority: "Alta" },
  ],
  scholarships: [
    { id: "s1", name: "Türkiye Scholarships", country: "Turquia", category: "Licenciatura", source: "https://www.turkiyeburslari.gov.tr", status: "Monitorizar", note: "Confirmar calendário e critérios oficiais para 2027/28." },
    { id: "s2", name: "Stipendium Hungaricum", country: "Hungria", category: "Licenciatura", source: "https://stipendiumhungaricum.hu", status: "Monitorizar", note: "Confirmar elegibilidade de Angola e requisitos de idioma." },
    { id: "s3", name: "INAGBE", country: "Angola / acordos", category: "Bolsa pública", source: "https://inagbe.gov.ao", status: "Monitorizar", note: "Acompanhar editais em paralelo às candidaturas diretas." },
  ],
  habits: {},
};

const curriculum = [
  { subject: "Matemática", focus: "Funções, álgebra e resolução de problemas", color: "blue" },
  { subject: "Física", focus: "Movimento, energia e aplicações matemáticas", color: "violet" },
  { subject: "Química", focus: "Estrutura da matéria e reações", color: "amber" },
  { subject: "Biologia", focus: "Sistemas, vida e método experimental", color: "emerald" },
];

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "painel", label: "Painel", icon: LayoutDashboard },
  { id: "estudo", label: "Estudo", icon: TimerReset },
  { id: "universidade", label: "Universidade", icon: GraduationCap },
  { id: "bolsas", label: "Bolsas", icon: Award },
  { id: "mais", label: "Mais", icon: Compass },
];

const habitLabels = ["Estudo", "Inglês", "Francês", "Exercício", "Leitura", "Sono", "Revisão", "Bolsas"];

function formatDate(value: string) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function initials(subject: string) {
  return subject.split(" ").map((word) => word[0]).join("").slice(0, 2);
}

export default function Home() {
  const [view, setView] = useState<View>("painel");
  const [data, setData] = useState<TrackerData>(defaultData);
  const [ready, setReady] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimate>({ usage: 0, quota: 0, usageLabel: "0 B", quotaLabel: "a calcular" });
  const [moreSection, setMoreSection] = useState<"calendário" | "hábitos" | "currículo">("calendário");
  const [sessionForm, setSessionForm] = useState({ date: today, subject: "Matemática", minutes: "45", topic: "", quality: "4" });
  const [assessmentForm, setAssessmentForm] = useState({ date: today, subject: "Matemática", type: "Teste", score: "", total: "20" });
  const [taskTitle, setTaskTitle] = useState("");
  const [scholarshipForm, setScholarshipForm] = useState({ name: "", country: "", source: "", note: "" });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadTrackerData(defaultData).then((stored) => {
      if (cancelled) return;
      setData(stored);
      setReady(true);
      void estimateStorage().then((estimate) => {
        if (!cancelled) setStorageEstimate(estimate);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveTrackerData(data).then(() => estimateStorage().then(setStorageEstimate));
  }, [data, ready]);

  const metrics = useMemo(() => {
    const totalMinutes = data.sessions.reduce((sum, session) => sum + session.minutes, 0);
    const averageGrade = data.assessments.length
      ? data.assessments.reduce((sum, item) => sum + (item.score / item.total) * 20, 0) / data.assessments.length
      : 0;
    const completedTasks = data.universityTasks.filter((task) => task.done).length;
    const todayHabits = data.habits[today] || {};
    const habitRate = (habitLabels.filter((habit) => todayHabits[habit]).length / habitLabels.length) * 100;
    const weekHours = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const iso = date.toISOString().slice(0, 10);
      const minutes = data.sessions.filter((session) => session.date === iso).reduce((sum, session) => sum + session.minutes, 0);
      return { name: new Intl.DateTimeFormat("pt-PT", { weekday: "short" }).format(date).replace(".", ""), horas: Number((minutes / 60).toFixed(1)) };
    });
    return { totalHours: totalMinutes / 60, averageGrade, completedTasks, habitRate, weekHours };
  }, [data]);

  const subjectStats = useMemo(() => subjects.map((subject) => {
    const sessions = data.sessions.filter((item) => item.subject === subject);
    const assessments = data.assessments.filter((item) => item.subject === subject);
    const hours = sessions.reduce((sum, item) => sum + item.minutes, 0) / 60;
    const grade = assessments.length ? assessments.reduce((sum, item) => sum + (item.score / item.total) * 20, 0) / assessments.length : null;
    return { subject, hours, grade };
  }).sort((a, b) => b.hours - a.hours), [data]);

  const addSession = (event: React.FormEvent) => {
    event.preventDefault();
    if (!sessionForm.topic.trim() || Number(sessionForm.minutes) <= 0) {
      toast.error("Indica o tema e uma duração válida.");
      return;
    }
    setData((current) => ({
      ...current,
      sessions: [{ id: crypto.randomUUID(), date: sessionForm.date, subject: sessionForm.subject, minutes: Number(sessionForm.minutes), topic: sessionForm.topic.trim(), quality: Number(sessionForm.quality) }, ...current.sessions],
    }));
    setSessionForm((current) => ({ ...current, topic: "" }));
    toast.success("Sessão registada no teu percurso.");
  };

  const addAssessment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!assessmentForm.score || !assessmentForm.total || Number(assessmentForm.total) <= 0) {
      toast.error("Indica a nota e a nota máxima.");
      return;
    }
    setData((current) => ({
      ...current,
      assessments: [{ id: crypto.randomUUID(), date: assessmentForm.date, subject: assessmentForm.subject, type: assessmentForm.type, score: Number(assessmentForm.score), total: Number(assessmentForm.total) }, ...current.assessments],
    }));
    setAssessmentForm((current) => ({ ...current, score: "" }));
    toast.success("Avaliação registada.");
  };

  const toggleHabit = (habit: string) => {
    setData((current) => ({
      ...current,
      habits: { ...current.habits, [today]: { ...(current.habits[today] || {}), [habit]: !current.habits[today]?.[habit] } },
    }));
  };

  const toggleTask = (id: string) => setData((current) => ({
    ...current,
    universityTasks: current.universityTasks.map((task) => task.id === id ? { ...task, done: !task.done } : task),
  }));

  const addTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    setData((current) => ({
      ...current,
      universityTasks: [...current.universityTasks, { id: crypto.randomUUID(), title: taskTitle.trim(), area: "Plano pessoal", due: "", done: false, priority: "Média" }],
    }));
    setTaskTitle("");
  };

  const addScholarship = (event: React.FormEvent) => {
    event.preventDefault();
    if (!scholarshipForm.name.trim() || !scholarshipForm.source.trim()) {
      toast.error("Indica o nome e a fonte oficial da oportunidade.");
      return;
    }
    setData((current) => ({
      ...current,
      scholarships: [...current.scholarships, { id: crypto.randomUUID(), name: scholarshipForm.name.trim(), country: scholarshipForm.country.trim() || "A confirmar", category: "A investigar", source: scholarshipForm.source.trim(), note: scholarshipForm.note.trim() || "Confirmar requisitos na fonte oficial.", status: "Monitorizar" }],
    }));
    setScholarshipForm({ name: "", country: "", source: "", note: "" });
    toast.success("Nova oportunidade guardada.");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "super-tracker-joselio.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Cópia dos teus dados descarregada.");
  };

  const setScholarshipStatus = (id: string, status: Scholarship["status"]) => setData((current) => ({
    ...current,
    scholarships: current.scholarships.map((item) => item.id === id ? { ...item, status } : item),
  }));

  const confirmAndRun = (message: string, action: () => void, success: string) => {
    if (!confirmDestructiveAction(window.confirm, message, action)) return;
    toast.success(success);
  };

  const clearSessions = () => confirmAndRun("Apagar todo o histórico de sessões de estudo? Esta ação não pode ser desfeita.", () => setData((current) => clearTrackerSection(current, "sessions")), "Histórico de estudo apagado.");
  const clearAssessments = () => confirmAndRun("Apagar todas as avaliações e médias registadas? Esta ação não pode ser desfeita.", () => setData((current) => clearTrackerSection(current, "assessments")), "Histórico de avaliações apagado.");
  const clearHabits = () => confirmAndRun("Apagar todos os hábitos marcados?", () => setData((current) => clearTrackerSection(current, "habits")), "Histórico de hábitos apagado.");
  const clearScholarships = () => confirmAndRun("Apagar todas as bolsas e oportunidades guardadas?", () => setData((current) => clearTrackerSection(current, "scholarships")), "Lista de bolsas apagada.");
  const clearTasks = () => confirmAndRun("Apagar todas as etapas do plano universitário?", () => setData((current) => clearTrackerSection(current, "universityTasks")), "Plano universitário apagado.");
  const clearAllData = () => confirmAndRun("Apagar TODOS os dados locais — estudo, avaliações, hábitos, plano e bolsas? Exporta uma cópia antes, se precisares de guardar o histórico.", () => setData((current) => clearTrackerSection(current, "all")), "Todos os dados locais foram apagados.");

  return (
    <div className="min-h-screen bg-[#f8f6ef] text-[#17213a]">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[236px] lg:flex-col lg:border-r lg:border-[#d9ddcf] lg:bg-[#fbfaf5] lg:px-5 lg:py-6">
        <Brand />
        <p className="mt-8 px-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7b8290]">Centro de missão</p>
        <nav className="mt-3 space-y-1">
          {navItems.map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />)}
        </nav>
        <div className="mt-auto rounded-[24px] bg-[#e7edff] p-4">
          <img src={orbitUrl} alt="Ilustração de percurso académico" className="mx-auto h-20 w-20 object-contain" />
          <p className="mt-2 font-serif text-base font-bold text-[#213f97]">Caminho 2027–2028</p>
          <p className="mt-1 text-xs leading-5 text-[#4d5f92]">A escola, as candidaturas e as bolsas no mesmo percurso.</p>
        </div>
      </aside>

      <main className="pb-24 lg:ml-[236px] lg:pb-8">
        <header className="sticky top-0 z-20 border-b border-[#e2e2d9]/80 bg-[#f8f6ef]/90 px-4 py-3 backdrop-blur-lg sm:px-7 lg:px-9">
          <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden"><Brand compact /></div>
            <div className="hidden lg:block"><p className="text-xs font-semibold text-[#63708a]">Sábado, 17 de agosto</p><p className="font-serif text-xl font-bold">Olá, Josélio.</p></div>
            <div className="flex items-center gap-2">
              <span
                title={isOnline ? "Online · dados guardados neste dispositivo" : "Offline · dados neste dispositivo"}
                aria-label={isOnline ? "Online · dados guardados neste dispositivo" : "Offline · dados neste dispositivo"}
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-bold sm:px-3 ${isOnline ? "bg-[#e9f2e8] text-[#336547]" : "bg-[#fff1c7] text-[#8b5a00]"}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                <span className="hidden sm:inline">{isOnline ? "Online · dados guardados" : "Offline · dados neste dispositivo"}</span>
              </span>
              <Button onClick={exportData} variant="outline" className="h-9 rounded-xl border-[#cdd4e7] bg-white text-xs font-bold text-[#274592] hover:bg-[#edf2ff]"><Download className="mr-1.5 h-4 w-4" />Exportar</Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
          {view === "painel" && <Dashboard metrics={metrics} subjectStats={subjectStats} sessions={data.sessions} onStartStudy={() => setView("estudo")} onOpenUni={() => setView("universidade")} />}
          {view === "estudo" && <StudyView sessionForm={sessionForm} setSessionForm={setSessionForm} assessmentForm={assessmentForm} setAssessmentForm={setAssessmentForm} onSession={addSession} onAssessment={addAssessment} sessions={data.sessions} assessments={data.assessments} subjectStats={subjectStats} onClearSessions={clearSessions} onClearAssessments={clearAssessments} />}
          {view === "universidade" && <UniversityView tasks={data.universityTasks} taskTitle={taskTitle} setTaskTitle={setTaskTitle} onAddTask={addTask} onToggle={toggleTask} />}
          {view === "bolsas" && <ScholarshipsView scholarships={data.scholarships} form={scholarshipForm} setForm={setScholarshipForm} onSubmit={addScholarship} onStatus={setScholarshipStatus} />}
          {view === "mais" && <MoreView section={moreSection} setSection={setMoreSection} habits={data.habits[today] || {}} onToggleHabit={toggleHabit} habitRate={metrics.habitRate} onClearHabits={clearHabits} onClearTasks={clearTasks} onClearScholarships={clearScholarships} onClearAll={clearAllData} onExport={exportData} storageEstimate={storageEstimate} />}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[72px] items-center justify-around border-t border-[#d8ddcf] bg-[#fbfaf5]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return <button key={item.id} onClick={() => setView(item.id)} className={`flex min-w-12 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold transition ${active ? "text-[#2457c5]" : "text-[#7b8290]"}`}><span className={`grid h-8 w-8 place-items-center rounded-xl ${active ? "bg-[#e2ebff]" : ""}`}><Icon className="h-[18px] w-[18px]" /></span>{item.label}</button>;
        })}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5"><img src={logoUrl} alt="Super Tracker" className="h-10 w-10 rounded-xl object-contain" /><div className={compact ? "" : ""}><p className="font-serif text-[18px] font-bold leading-none tracking-[-0.03em] text-[#1e357b]">Super Tracker</p><p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#7e8796]">Caderno de Josélio</p></div></div>;
}

function NavButton({ item, active, onClick }: { item: { id: View; label: string; icon: typeof LayoutDashboard }; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${active ? "bg-[#e2ebff] text-[#2457c5] shadow-[0_8px_20px_rgba(36,87,197,0.08)]" : "text-[#5e687b] hover:bg-[#f0f0e9] hover:text-[#24335c]"}`}><Icon className="h-[18px] w-[18px]" />{item.label}</button>;
}

function Dashboard({ metrics, subjectStats, sessions, onStartStudy, onOpenUni }: { metrics: ReturnType<typeof useMetrics>; subjectStats: { subject: string; hours: number; grade: number | null }[]; sessions: StudySession[]; onStartStudy: () => void; onOpenUni: () => void }) {
  const hoursProgress = Math.min((metrics.totalHours / 35) * 100, 100);
  const nextFocus = subjectStats.find((item) => item.hours === 0)?.subject || subjectStats[0]?.subject || "Matemática";
  return <>
    <section className="overflow-hidden rounded-[30px] border border-[#d9ddcf] bg-[#1f3d90] shadow-[0_20px_50px_rgba(31,61,144,0.16)]">
      <div className="grid min-h-[270px] md:grid-cols-[1.25fr_.75fr]">
        <div className="relative z-10 flex flex-col justify-between p-6 text-white sm:p-8 lg:p-10">
          <div><div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white/90"><Sparkles className="h-3.5 w-3.5 text-[#f6c95f]" /> Missão em andamento</div><h1 className="mt-5 max-w-xl font-serif text-3xl font-bold leading-tight sm:text-4xl">Hoje, cada sessão aproxima-te da tua candidatura.</h1><p className="mt-3 max-w-lg text-sm leading-6 text-[#dce6ff]">O teu ciclo une o ano letivo de dezembro a julho e a preparação universitária para 2027–2028.</p></div>
          <div className="mt-8 flex flex-wrap gap-3"><Button onClick={onStartStudy} className="h-11 rounded-xl bg-[#f6c95f] px-5 font-bold text-[#26354f] hover:bg-[#ffe094]"><Plus className="mr-1.5 h-4 w-4" />Registar estudo</Button><Button onClick={onOpenUni} variant="outline" className="h-11 rounded-xl border-white/30 bg-white/10 px-5 font-bold text-white hover:bg-white/20 hover:text-white">Ver plano universitário<ChevronRight className="ml-1 h-4 w-4" /></Button></div>
        </div>
        <div className="relative min-h-[230px] overflow-hidden"><img src={heroUrl} alt="Secretária organizada para estudo" className="h-full w-full object-cover opacity-90" /><div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#1f3d90]/10 to-[#1f3d90]/75 md:bg-gradient-to-r" /></div>
      </div>
    </section>

    <section className="mission-strip mt-5 flex flex-col gap-4 rounded-[22px] border border-[#cdd9fa] bg-[#eff4ff] px-5 py-4 shadow-[0_10px_24px_rgba(36,87,197,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2457c5] text-white"><Compass className="h-5 w-5" /></span><div><p className="tag text-[#506aa8]">Próximo passo académico</p><p className="mt-1 font-serif text-xl font-bold text-[#263c82]">Ativa {nextFocus} com uma sessão de 45 minutos.</p><p className="mt-1 text-sm text-[#566b9e]">É a forma mais simples de transformar o plano de candidatura em prática diária.</p></div></div>
      <Button onClick={onStartStudy} className="h-10 shrink-0 rounded-xl bg-[#2457c5] px-4 font-bold hover:bg-[#193f98]"><TimerReset className="mr-1.5 h-4 w-4" />Abrir sessão</Button>
    </section>

    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={Clock3} label="Horas registadas" value={`${metrics.totalHours.toFixed(1)} h`} note="Meta mensal: 35 h" accent="blue" />
      <MetricCard icon={Trophy} label="Média atual" value={metrics.averageGrade ? metrics.averageGrade.toFixed(1) : "—"} note={metrics.averageGrade ? "Escala de 0–20" : "Regista uma avaliação"} accent="gold" />
      <MetricCard icon={GraduationCap} label="Plano universitário" value={`${metrics.completedTasks}`} note="tarefas concluídas" accent="green" />
      <MetricCard icon={Target} label="Hábitos de hoje" value={`${Math.round(metrics.habitRate)}%`} note="consistência diária" accent="violet" />
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6">
        <div className="flex items-start justify-between"><div><p className="tag">Ritmo da semana</p><h2 className="mt-2 font-serif text-2xl font-bold">Horas de estudo</h2></div><span className="rounded-full bg-[#e8efff] px-3 py-1.5 text-xs font-bold text-[#2457c5]">Meta: 5 h/dia</span></div>
        <div className="mt-5 h-[225px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={metrics.weekHours} margin={{ top: 15, right: 5, left: -28, bottom: 0 }}><defs><linearGradient id="hours" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2457c5" stopOpacity={0.28}/><stop offset="100%" stopColor="#2457c5" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#eef0ea" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#7b8290", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#7b8290", fontSize: 11 }} /><Tooltip cursor={{ stroke: "#cfd8f6" }} contentStyle={{ borderRadius: 14, borderColor: "#dde3f3", fontSize: 12 }} /><Area type="monotone" dataKey="horas" stroke="#2457c5" strokeWidth={3} fill="url(#hours)" /></AreaChart></ResponsiveContainer></div>
      </div>
      <div className="rounded-[26px] border border-[#dfe2d7] bg-[#fffdf8] p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><p className="tag">Nota de margem</p><div className="mt-4 rounded-2xl border border-dashed border-[#e8d794] bg-[#fff7df] p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f6c95f] text-[#534216]"><BookOpen className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-[#856d29]">Ritmo de candidatura</p><p className="font-serif text-lg font-bold text-[#36415d]">Uma semana, uma evidência</p></div></div><p className="mt-3 text-sm leading-5 text-[#6d654d]">Regista uma sessão, conclui uma etapa universitária ou valida uma bolsa. O progresso precisa de prova.</p></div><div className="notebook-rule mt-5 pt-4"><div className="flex justify-between text-xs font-bold"><span>Meta de horas do mês</span><span>{metrics.totalHours.toFixed(1)} / 35 h</span></div><Progress value={hoursProgress} className="mt-2 h-2 bg-[#e7e6df] [&>div]:bg-[#2457c5]" /></div></div>
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><div className="flex items-center justify-between"><div><p className="tag">Mapa académico</p><h2 className="mt-2 font-serif text-2xl font-bold">Disciplinas</h2></div><span className="text-xs font-bold text-[#6f7890]">11 no percurso</span></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{subjectStats.slice(0, 6).map((item) => <div key={item.subject} className="flex items-center justify-between rounded-2xl bg-[#f8f8f5] px-3 py-3"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e3ebff] text-[10px] font-extrabold text-[#2457c5]">{initials(item.subject)}</span><span className="text-sm font-bold">{item.subject}</span></div><span className="text-xs font-bold text-[#6b7485]">{item.hours ? `${item.hours.toFixed(1)} h` : "Começar"}</span></div>)}</div></div>
      <div className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><div className="flex items-center justify-between"><div><p className="tag">Últimos registos</p><h2 className="mt-2 font-serif text-2xl font-bold">Estudo diário</h2></div><TimerReset className="h-5 w-5 text-[#7d8ec4]" /></div><div className="mt-4 space-y-2">{sessions.slice(0, 4).map((session) => <div key={session.id} className="flex items-center gap-3 rounded-xl bg-[#f8f8f5] p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e9f2e8] text-[#36734c]"><Clock3 className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{session.topic}</p><p className="text-xs text-[#737c8d]">{session.subject} · {formatDate(session.date)}</p></div><span className="text-xs font-extrabold text-[#2457c5]">{session.minutes} min</span></div>)}{!sessions.length && <EmptyState icon={BookOpen} text="Ainda não há sessões. Regista a primeira acima." />}</div></div>
    </section>
  </>;
}

function useMetrics() { return { totalHours: 0, averageGrade: 0, completedTasks: 0, habitRate: 0, weekHours: [] as { name: string; horas: number }[] }; }

function MetricCard({ icon: Icon, label, value, note, accent }: { icon: typeof Clock3; label: string; value: string; note: string; accent: "blue" | "gold" | "green" | "violet" }) {
  const styles = { blue: "bg-[#e5edff] text-[#2457c5]", gold: "bg-[#fff2ca] text-[#ae7800]", green: "bg-[#e3f2e7] text-[#287044]", violet: "bg-[#eee8ff] text-[#6844bd]" };
  return <div className="rounded-[22px] border border-[#dfe2d7] bg-white p-4 shadow-[0_10px_24px_rgba(36,48,80,0.04)]"><div className="flex items-center justify-between"><p className="text-xs font-bold text-[#6f7890]">{label}</p><span className={`grid h-8 w-8 place-items-center rounded-xl ${styles[accent]}`}><Icon className="h-4 w-4" /></span></div><p className="mt-3 font-serif text-3xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-[#8a92a0]">{note}</p></div>;
}

function StudyView({ sessionForm, setSessionForm, assessmentForm, setAssessmentForm, onSession, onAssessment, sessions, assessments, subjectStats, onClearSessions, onClearAssessments }: { sessionForm: { date: string; subject: string; minutes: string; topic: string; quality: string }; setSessionForm: React.Dispatch<React.SetStateAction<{ date: string; subject: string; minutes: string; topic: string; quality: string }>>; assessmentForm: { date: string; subject: string; type: string; score: string; total: string }; setAssessmentForm: React.Dispatch<React.SetStateAction<{ date: string; subject: string; type: string; score: string; total: string }>>; onSession: (event: React.FormEvent) => void; onAssessment: (event: React.FormEvent) => void; sessions: StudySession[]; assessments: Assessment[]; subjectStats: { subject: string; hours: number; grade: number | null }[]; onClearSessions: () => void; onClearAssessments: () => void }) {
  return <div className="space-y-6"><PageHeading eyebrow="Registo diário" title="Estudo, notas e progresso" description="Regista o que fizeste hoje. Os dados ficam guardados no teu dispositivo e atualizam o Painel." />
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <form onSubmit={onSession} className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3ebff] text-[#2457c5]"><Plus className="h-5 w-5" /></span><div><p className="tag">Nova sessão</p><h2 className="font-serif text-xl font-bold">Registar estudo</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Data"><Input type="date" value={sessionForm.date} onChange={(e) => setSessionForm((form) => ({ ...form, date: e.target.value }))} /></Field><Field label="Disciplina"><SubjectSelect value={sessionForm.subject} onChange={(subject) => setSessionForm((form) => ({ ...form, subject }))} /></Field><Field label="Minutos"><Input inputMode="numeric" value={sessionForm.minutes} onChange={(e) => setSessionForm((form) => ({ ...form, minutes: e.target.value }))} placeholder="45" /></Field><Field label="Qualidade"><Select value={sessionForm.quality} onValueChange={(quality) => setSessionForm((form) => ({ ...form, quality }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5].map((value) => <SelectItem key={value} value={String(value)}>{value} / 5</SelectItem>)}</SelectContent></Select></Field><div className="sm:col-span-2"><Field label="Tema ou tarefa"><Input value={sessionForm.topic} onChange={(e) => setSessionForm((form) => ({ ...form, topic: e.target.value }))} placeholder="Ex.: Exercícios de funções quadráticas" /></Field></div></div><Button className="mt-5 h-11 w-full rounded-xl bg-[#2457c5] font-bold hover:bg-[#193f98]"><BookOpen className="mr-2 h-4 w-4" />Guardar sessão</Button></form>
      <form onSubmit={onAssessment} className="rounded-[26px] border border-[#dfe2d7] bg-[#fffcf5] p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0c8] text-[#a47400]"><Trophy className="h-5 w-5" /></span><div><p className="tag">Avaliação</p><h2 className="font-serif text-xl font-bold">Registar nota</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Data"><Input type="date" value={assessmentForm.date} onChange={(e) => setAssessmentForm((form) => ({ ...form, date: e.target.value }))} /></Field><Field label="Disciplina"><SubjectSelect value={assessmentForm.subject} onChange={(subject) => setAssessmentForm((form) => ({ ...form, subject }))} /></Field><Field label="Tipo"><Select value={assessmentForm.type} onValueChange={(type) => setAssessmentForm((form) => ({ ...form, type }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Teste","Prova trimestral","Exame","Trabalho","Projeto","Oral"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></Field><Field label="Nota obtida / máxima"><div className="flex gap-2"><Input inputMode="decimal" value={assessmentForm.score} onChange={(e) => setAssessmentForm((form) => ({ ...form, score: e.target.value }))} placeholder="15" /><Input inputMode="decimal" value={assessmentForm.total} onChange={(e) => setAssessmentForm((form) => ({ ...form, total: e.target.value }))} placeholder="20" /></div></Field></div><Button className="mt-5 h-11 w-full rounded-xl bg-[#ae7800] font-bold text-white hover:bg-[#8f6200]"><Trophy className="mr-2 h-4 w-4" />Guardar avaliação</Button></form>
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><div className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><div><p className="tag">Histórico</p><h2 className="mt-1 font-serif text-2xl font-bold">Sessões recentes</h2></div><div className="mt-5 space-y-2">{sessions.slice(0, 10).map((session) => <div key={session.id} className="flex items-center gap-3 rounded-2xl border border-[#edf0e8] p-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f0ff] text-xs font-extrabold text-[#2457c5]">{initials(session.subject)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{session.topic}</p><p className="text-xs text-[#7e8797]">{session.subject} · {formatDate(session.date)} · Qualidade {session.quality}/5</p></div><span className="text-xs font-extrabold text-[#24478f]">{session.minutes} min</span></div>)}{!sessions.length && <EmptyState icon={Clock3} text="O teu histórico vai aparecer aqui." />}</div></div><div className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><p className="tag">Painel académico</p><h2 className="mt-1 font-serif text-2xl font-bold">Notas por disciplina</h2><div className="mt-5 space-y-3">{subjectStats.slice(0, 7).map((item) => <div key={item.subject}><div className="flex justify-between text-xs font-bold"><span>{item.subject}</span><span className="text-[#2457c5]">{item.grade === null ? "Sem nota" : `${item.grade.toFixed(1)} / 20`}</span></div><Progress value={item.grade ? (item.grade / 20) * 100 : 0} className="mt-1.5 h-2 bg-[#edf0e9] [&>div]:bg-[#2457c5]" /></div>)}</div><div className="mt-5 border-t border-[#edf0e9] pt-4"><p className="text-xs font-bold text-[#697488]">{assessments.length} avaliações registadas</p></div></div></div>
    <HistoryControls sessions={sessions.length} assessments={assessments.length} onClearSessions={onClearSessions} onClearAssessments={onClearAssessments} />
  </div>;
}

function UniversityView({ tasks, taskTitle, setTaskTitle, onAddTask, onToggle }: { tasks: UniversityTask[]; taskTitle: string; setTaskTitle: (value: string) => void; onAddTask: (event: React.FormEvent) => void; onToggle: (id: string) => void }) {
  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? (completed / tasks.length) * 100 : 0;
  return <div className="space-y-6"><PageHeading eyebrow="Projeto 2027–2028" title="Preparação para a universidade" description="Organiza os documentos, idiomas, perfil académico e decisões que tornam a candidatura possível." />
    <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><div className="relative overflow-hidden rounded-[28px] bg-[#24478f] p-6 text-white shadow-[0_18px_45px_rgba(36,71,143,.18)]"><img src={orbitUrl} alt="Órbita de estudo" className="absolute -right-7 -top-5 h-40 w-40 opacity-80" /><div className="relative"><span className="tag text-[#cddaff]">Progresso do percurso</span><p className="mt-4 font-serif text-5xl font-bold">{Math.round(progress)}%</p><p className="mt-2 max-w-sm text-sm leading-6 text-[#dbe5ff]">{completed} de {tasks.length} etapas concluídas. Cada etapa concluída reforça a tua candidatura.</p><Progress value={progress} className="mt-6 h-2 bg-white/20 [&>div]:bg-[#f6c95f]" /></div></div><form onSubmit={onAddTask} className="rounded-[28px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><p className="tag">Adicionar etapa</p><h2 className="mt-1 font-serif text-2xl font-bold">O que vais preparar a seguir?</h2><div className="mt-5 flex flex-col gap-2 sm:flex-row"><Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Ex.: Pedir declaração escolar" /><Button className="h-10 rounded-xl bg-[#2457c5] font-bold hover:bg-[#193f98]"><Plus className="mr-1.5 h-4 w-4" />Adicionar</Button></div><p className="mt-3 text-xs leading-5 text-[#798394]">As tarefas criadas aqui ficam guardadas no dispositivo e aparecem neste plano.</p></form></section>
    <section className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="tag">Checklist vivo</p><h2 className="mt-1 font-serif text-2xl font-bold">Etapas prioritárias</h2></div><span className="rounded-full bg-[#eef3ff] px-3 py-1.5 text-xs font-bold text-[#2457c5]">Meta: candidatura integral</span></div><div className="mt-5 grid gap-3 md:grid-cols-2">{tasks.map((task) => <button key={task.id} onClick={() => onToggle(task.id)} className={`group flex min-h-[112px] items-start gap-3 rounded-2xl border p-4 text-left transition ${task.done ? "border-[#cde6d4] bg-[#f2fbf4]" : "border-[#e5e8df] bg-[#fffefb] hover:border-[#b8c9f4]"}`}><span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${task.done ? "border-[#398457] bg-[#398457] text-white" : "border-[#bdc5d4] text-transparent"}`}><Check className="h-4 w-4" /></span><span className="min-w-0"><span className="flex items-center gap-2"><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#7b8495]">{task.area}</span>{task.priority === "Alta" && <span className="h-1.5 w-1.5 rounded-full bg-[#dc803c]" />}</span><span className={`mt-1 block text-sm font-bold ${task.done ? "text-[#5d7967] line-through" : "text-[#26334f]"}`}>{task.title}</span>{task.due && <span className="mt-2 block text-xs text-[#7b8495]">Até {formatDate(task.due)}</span>}</span></button>)}</div></section>
  </div>;
}

function ScholarshipsView({ scholarships, form, setForm, onSubmit, onStatus }: { scholarships: Scholarship[]; form: { name: string; country: string; source: string; note: string }; setForm: React.Dispatch<React.SetStateAction<{ name: string; country: string; source: string; note: string }>>; onSubmit: (event: React.FormEvent) => void; onStatus: (id: string, status: Scholarship["status"]) => void }) {
  return <div className="space-y-6"><PageHeading eyebrow="Oportunidades" title="Bolsas e fontes oficiais" description="Mantém uma lista viva de oportunidades. Antes de agir, confirma sempre os requisitos, prazos e documentos diretamente na fonte oficial." />
    <section className="grid gap-6 xl:grid-cols-[.86fr_1.14fr]"><form onSubmit={onSubmit} className="rounded-[27px] bg-[#fff3cf] p-5 shadow-[0_14px_34px_rgba(131,94,14,0.09)] sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f6c95f] text-[#6f5000]"><CircleDollarSign className="h-5 w-5" /></span><div><p className="tag text-[#8d6c1d]">Descoberta contínua</p><h2 className="font-serif text-xl font-bold text-[#504015]">Guardar nova oportunidade</h2></div></div><div className="mt-5 space-y-3"><Field label="Nome do programa"><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome da bolsa" /></Field><Field label="País ou região"><Input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} placeholder="Ex.: Portugal" /></Field><Field label="Fonte oficial"><Input type="url" value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} placeholder="https://..." /></Field><Field label="Nota curta"><Input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="O que falta confirmar?" /></Field></div><Button className="mt-5 h-11 w-full rounded-xl bg-[#a87300] font-bold hover:bg-[#865f00]"><Plus className="mr-2 h-4 w-4" />Guardar oportunidade</Button></form>
      <div className="space-y-3">{scholarships.map((item) => <article key={item.id} className="rounded-[24px] border border-[#dfe2d7] bg-white p-5 shadow-[0_10px_25px_rgba(36,48,80,0.045)]"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="tag">{item.country}</span><span className="rounded-full bg-[#eff4ff] px-2.5 py-1 text-[10px] font-extrabold text-[#2457c5]">{item.category}</span></div><h2 className="mt-2 font-serif text-2xl font-bold">{item.name}</h2></div><Select value={item.status} onValueChange={(status: Scholarship["status"]) => onStatus(item.id, status)}><SelectTrigger className="w-[165px] rounded-xl border-[#d6deef] text-xs font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Monitorizar">Monitorizar</SelectItem><SelectItem value="Em preparação">Em preparação</SelectItem><SelectItem value="Candidatura enviada">Candidatura enviada</SelectItem></SelectContent></Select></div><p className="mt-3 text-sm leading-6 text-[#667085]">{item.note}</p><a href={item.source} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2457c5] hover:text-[#193f98]">Abrir fonte oficial <ArrowUpRight className="h-3.5 w-3.5" /></a></article>)}</div>
    </section>
  </div>;
}

function MoreView({ section, setSection, habits, onToggleHabit, habitRate, onClearHabits, onClearTasks, onClearScholarships, onClearAll, onExport, storageEstimate }: { section: "calendário" | "hábitos" | "currículo"; setSection: (section: "calendário" | "hábitos" | "currículo") => void; habits: Record<string, boolean>; onToggleHabit: (habit: string) => void; habitRate: number; onClearHabits: () => void; onClearTasks: () => void; onClearScholarships: () => void; onClearAll: () => void; onExport: () => void; storageEstimate: StorageEstimate }) {
  const months = ["Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];
  const [largeFiles, setLargeFiles] = useState<StoredFileMetadata[]>([]);
  const [fileStatus, setFileStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadLargeFileMetadata().then(setLargeFiles);
  }, []);

  const fileSizeLabel = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  const handleLargeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const saved = await saveLargeFile(file.name, file);
      if (!saved) {
        setFileStatus("OPFS não está disponível neste navegador.");
        return;
      }
      const next = [...largeFiles.filter((item) => item.name !== file.name), { name: file.name, size: file.size, type: file.type || "application/octet-stream", updatedAt: Date.now() }];
      setLargeFiles(next);
      await saveLargeFileMetadata(next);
      setFileStatus(`${file.name} guardado no armazenamento privado.`);
    } catch {
      setFileStatus("Não foi possível guardar este ficheiro.");
    }
  };

  const handleRemoveLargeFile = async (fileName: string) => {
    try {
      await removeLargeFile(fileName);
      const next = largeFiles.filter((item) => item.name !== fileName);
      setLargeFiles(next);
      await saveLargeFileMetadata(next);
      setFileStatus(`${fileName} removido.`);
    } catch {
      setFileStatus("Não foi possível remover este ficheiro.");
    }
  };

  return <div className="space-y-6"><PageHeading eyebrow="Ferramentas de apoio" title="Calendário, hábitos e currículo" description="Informação organizada em blocos verticais para continuar confortável no telemóvel." />
    <div className="inline-flex rounded-xl bg-[#e8ebe6] p-1">{(["calendário", "hábitos", "currículo"] as const).map((item) => <button key={item} onClick={() => setSection(item)} className={`rounded-lg px-3 py-2 text-xs font-extrabold capitalize transition ${section === item ? "bg-white text-[#2457c5] shadow-sm" : "text-[#6e7685]"}`}>{item}</button>)}</div>
    {section === "calendário" && <section className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><p className="tag">Ciclo 2026/2027</p><h2 className="mt-1 font-serif text-2xl font-bold">Mapa de tempo</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{months.map((month, index) => { const preparation = index < 4; const trimester = index < 4 ? "Preparação universitária" : index < 7 ? "1º trimestre" : index < 9 ? "2º trimestre" : "3º trimestre"; return <div key={month} className={`rounded-2xl border p-4 ${preparation ? "border-[#dce6ff] bg-[#f4f7ff]" : "border-[#e7e6dd] bg-[#fffefb]"}`}><div className="flex items-center justify-between"><span className="font-serif text-xl font-bold">{month}</span><span className={`h-2.5 w-2.5 rounded-full ${preparation ? "bg-[#6386d8]" : "bg-[#59a777]"}`} /></div><p className="mt-5 text-xs font-bold text-[#697487]">{trimester}</p><p className="mt-1 text-sm text-[#43506b]">{preparation ? "Idiomas, perfil, bolsas e documentos." : "Aulas, exercícios, avaliações e revisão."}</p></div>})}</div></section>}
    {section === "hábitos" && <section className="grid gap-6 xl:grid-cols-[.7fr_1.3fr]"><div className="rounded-[26px] bg-[#315d4c] p-6 text-white"><p className="tag text-[#c2e6cd]">Hoje</p><p className="mt-2 font-serif text-5xl font-bold">{Math.round(habitRate)}%</p><p className="mt-2 text-sm leading-6 text-[#d4eadb]">A consistência pequena e repetida constrói a preparação maior.</p><Progress value={habitRate} className="mt-6 h-2 bg-white/20 [&>div]:bg-[#f6c95f]" /></div><div className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><p className="tag">Rotina diária</p><h2 className="mt-1 font-serif text-2xl font-bold">Marca o que fizeste</h2><div className="mt-5 grid gap-2 sm:grid-cols-2">{habitLabels.map((habit) => <button key={habit} onClick={() => onToggleHabit(habit)} className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${habits[habit] ? "border-[#cfe4d5] bg-[#effaf1]" : "border-[#e4e8df] bg-[#fffefb] hover:border-[#c7d4f4]"}`}><span className="text-sm font-bold">{habit}</span><span className={`grid h-6 w-6 place-items-center rounded-full border ${habits[habit] ? "border-[#3f8a5c] bg-[#3f8a5c] text-white" : "border-[#bdc5d4] text-transparent"}`}><Check className="h-4 w-4" /></span></button>)}</div></div></section>}
    {section === "currículo" && <section className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><p className="tag">Referência interdisciplinar</p><h2 className="mt-1 font-serif text-2xl font-bold">Currículo em blocos</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#707b8d]">Usa estes blocos para ligar temas, exercícios e revisões. A versão Excel continua a guardar o detalhe importado dos PPP.</p><div className="mt-6 grid gap-3 md:grid-cols-2">{curriculum.map((item) => <article key={item.subject} className="rounded-2xl border border-[#e4e7df] bg-[#fffefb] p-5"><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${item.color === "blue" ? "bg-[#2457c5]" : item.color === "violet" ? "bg-[#8451c4]" : item.color === "amber" ? "bg-[#d79620]" : "bg-[#4f9b68]"}`} /><h3 className="font-serif text-xl font-bold">{item.subject}</h3></div><p className="mt-3 text-sm leading-6 text-[#667085]">{item.focus}</p><button className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-[#2457c5]">Criar sessão de estudo <ChevronRight className="h-3.5 w-3.5" /></button></article>)}</div></section>}
    <section className="rounded-[26px] border border-[#dfe2d7] bg-white p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="tag">Armazenamento offline</p><h2 className="mt-1 font-serif text-2xl font-bold">Dados no dispositivo</h2><p className="mt-2 text-sm leading-6 text-[#707b8d]">IndexedDB guarda o tracker; o cache offline mantém a aplicação disponível sem Internet.</p></div><span className="rounded-full bg-[#edf2ff] px-3 py-1.5 text-xs font-bold text-[#2457c5]">IndexedDB</span></div><div className="mt-5 flex items-center justify-between text-sm font-bold"><span>{storageEstimate.usageLabel} usados</span><span className="text-[#778196]">de {storageEstimate.quotaLabel}</span></div><Progress value={storageEstimate.quota ? Math.min(100, (storageEstimate.usage / storageEstimate.quota) * 100) : 0} className="mt-2 h-2 bg-[#e9edf7] [&>div]:bg-[#2457c5]" /></section><section className="rounded-[26px] border border-[#ded8ea] bg-[#fcfaff] p-5 shadow-[0_12px_30px_rgba(36,48,80,0.05)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="tag text-[#7250a3]">Ficheiros grandes</p><h2 className="mt-1 font-serif text-2xl font-bold">Arquivo privado OPFS</h2><p className="mt-2 text-sm leading-6 text-[#707b8d]">Guarda PDFs, imagens e ficheiros de estudo no sandbox privado do navegador.</p></div><Button onClick={() => fileInputRef.current?.click()} variant="outline" className="shrink-0 rounded-xl border-[#cbbbe4] bg-white text-xs font-bold text-[#7250a3]">Adicionar</Button></div><input ref={fileInputRef} type="file" className="hidden" onChange={handleLargeFile} /><div className="mt-4 space-y-2">{largeFiles.length ? largeFiles.map((file) => <div key={file.name} className="flex items-center justify-between gap-3 rounded-xl border border-[#e9e1f3] bg-white px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-bold">{file.name}</p><p className="text-xs text-[#788194]">{fileSizeLabel(file.size)} · {file.type || "ficheiro"}</p></div><button onClick={() => void handleRemoveLargeFile(file.name)} className="text-xs font-extrabold text-[#a14837]">Remover</button></div>) : <p className="text-sm text-[#788194]">Ainda não há ficheiros grandes guardados.</p>}</div>{fileStatus && <p className="mt-3 text-xs font-bold text-[#7250a3]">{fileStatus}</p>}</section><DataControls onClearHabits={onClearHabits} onClearTasks={onClearTasks} onClearScholarships={onClearScholarships} onClearAll={onClearAll} onExport={onExport} />
  </div>;
}

function HistoryControls({ sessions, assessments, onClearSessions, onClearAssessments }: { sessions: number; assessments: number; onClearSessions: () => void; onClearAssessments: () => void }) {
  return <section className="rounded-[26px] border border-[#efd9d2] bg-[#fff8f5] p-5 shadow-[0_12px_30px_rgba(88,42,33,0.04)] sm:p-6"><p className="tag text-[#9a5a49]">Gestão do histórico</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#4d2d27]">Apagar registos</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#765d56]">Estas ações apagam apenas os dados escolhidos. Antes de eliminar, podes usar “Exportar” para guardar uma cópia.</p><div className="mt-5 flex flex-wrap gap-3"><Button onClick={onClearSessions} disabled={!sessions} variant="outline" className="h-10 rounded-xl border-[#e5b8ac] bg-white font-bold text-[#a14837] hover:bg-[#fff0eb] hover:text-[#8d392c]"><Trash2 className="mr-1.5 h-4 w-4" />Apagar {sessions} sessões</Button><Button onClick={onClearAssessments} disabled={!assessments} variant="outline" className="h-10 rounded-xl border-[#e5b8ac] bg-white font-bold text-[#a14837] hover:bg-[#fff0eb] hover:text-[#8d392c]"><Trash2 className="mr-1.5 h-4 w-4" />Apagar {assessments} avaliações</Button></div></section>;
}

function DataControls({ onClearHabits, onClearTasks, onClearScholarships, onClearAll, onExport }: { onClearHabits: () => void; onClearTasks: () => void; onClearScholarships: () => void; onClearAll: () => void; onExport: () => void }) {
  return <section className="rounded-[26px] border border-[#efd9d2] bg-[#fff8f5] p-5 shadow-[0_12px_30px_rgba(88,42,33,0.04)] sm:p-6"><p className="tag text-[#9a5a49]">Dados locais</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#4d2d27]">Limpeza e cópia de segurança</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#765d56]">Cada botão pede confirmação. Exporta primeiro se quiseres conservar os teus dados antes de apagar.</p><div className="mt-5 flex flex-wrap gap-3"><Button onClick={onExport} variant="outline" className="h-10 rounded-xl border-[#cdd4e7] bg-white font-bold text-[#274592] hover:bg-[#edf2ff]"><Download className="mr-1.5 h-4 w-4" />Exportar cópia</Button><Button onClick={onClearHabits} variant="outline" className="h-10 rounded-xl border-[#e5b8ac] bg-white font-bold text-[#a14837] hover:bg-[#fff0eb] hover:text-[#8d392c]"><Trash2 className="mr-1.5 h-4 w-4" />Hábitos</Button><Button onClick={onClearTasks} variant="outline" className="h-10 rounded-xl border-[#e5b8ac] bg-white font-bold text-[#a14837] hover:bg-[#fff0eb] hover:text-[#8d392c]"><Trash2 className="mr-1.5 h-4 w-4" />Plano</Button><Button onClick={onClearScholarships} variant="outline" className="h-10 rounded-xl border-[#e5b8ac] bg-white font-bold text-[#a14837] hover:bg-[#fff0eb] hover:text-[#8d392c]"><Trash2 className="mr-1.5 h-4 w-4" />Bolsas</Button><Button onClick={onClearAll} className="h-10 rounded-xl bg-[#a14837] font-bold text-white hover:bg-[#873626]"><Trash2 className="mr-1.5 h-4 w-4" />Apagar tudo</Button></div></section>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <header><p className="tag">{eyebrow}</p><h1 className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f798b]">{description}</p></header>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-extrabold text-[#58647a]"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function SubjectSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{subjects.map((subject) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent></Select>; }
function EmptyState({ icon: Icon, text }: { icon: typeof BookOpen; text: string }) { return <div className="rounded-2xl border border-dashed border-[#dbe0d7] bg-[#fbfcf9] p-5 text-center"><Icon className="mx-auto h-5 w-5 text-[#9ca6b6]" /><p className="mt-2 text-xs font-bold text-[#7c8696]">{text}</p></div>; }
