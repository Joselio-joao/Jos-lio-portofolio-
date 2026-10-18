import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { PlaceholderPage } from "./pages/PortfolioSections";
import { CalendarDays, FolderKanban, Hammer } from "lucide-react";
import PortfolioAdmin from "./pages/PortfolioAdmin";
import PortfolioAccessGate from "./components/PortfolioAccessGate";
import SupabaseLogin from "./pages/SupabaseLogin";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";


function Router() {
  return (
    <WouterRouter>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/Jos-lio-portofolio-"} component={Home} />
        <Route path={"/Jos-lio-portofolio-/"} component={Home} />
        <Route path={"/projectos"} component={() => <PlaceholderPage title="Projectos" eyebrow="Portefólio" icon={FolderKanban} kind="projectos" description="Espaço para apresentar projectos pessoais, académicos e de inovação desenvolvidos por Josélio João." />} />
        <Route path={"/Jos-lio-portofolio-/projectos"} component={() => <PlaceholderPage title="Projectos" eyebrow="Portefólio" icon={FolderKanban} kind="projectos" description="Espaço para apresentar projectos pessoais, académicos e de inovação desenvolvidos por Josélio João." />} />
        <Route path={"/eventos"} component={() => <PlaceholderPage title="Eventos" eyebrow="Participação" icon={CalendarDays} kind="eventos" description="Página dedicada a eventos, encontros, palestras e actividades relevantes na jornada de Josélio João." />} />
        <Route path={"/Jos-lio-portofolio-/eventos"} component={() => <PlaceholderPage title="Eventos" eyebrow="Participação" icon={CalendarDays} kind="eventos" description="Página dedicada a eventos, encontros, palestras e actividades relevantes na jornada de Josélio João." />} />
        <Route path={"/obras"} component={() => <PlaceholderPage title="Obras" eyebrow="Produção" icon={Hammer} kind="obras" description="Espaço para reunir obras, criações, invenções e outros trabalhos desenvolvidos ao longo do percurso." />} />
        <Route path={"/Jos-lio-portofolio-/obras"} component={() => <PlaceholderPage title="Obras" eyebrow="Produção" icon={Hammer} kind="obras" description="Espaço para reunir obras, criações, invenções e outros trabalhos desenvolvidos ao longo do percurso." />} />
        <Route path={"/gestao"} component={PortfolioAdmin} />
        <Route path={"/Jos-lio-portofolio-/gestao"} component={PortfolioAdmin} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function PrivateRouter() {
  return <PortfolioAccessGate><Router /></PortfolioAccessGate>;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <SupabaseAuthProvider>
            <WouterRouter>
              <Switch>
                <Route path={"/login"} component={SupabaseLogin} />
                <Route path={"/Jos-lio-portofolio-/login"} component={SupabaseLogin} />
                <Route component={PrivateRouter} />
              </Switch>
            </WouterRouter>
          </SupabaseAuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
