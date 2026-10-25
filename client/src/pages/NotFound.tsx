import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4" aria-labelledby="not-found-title">
      <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-100/70" aria-hidden="true" />
              <AlertCircle className="relative h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 id="not-found-title" className="mb-2 text-4xl font-bold text-slate-900">404</h1>

          <h2 className="mb-4 text-xl font-semibold text-slate-700">
            Página não encontrada
          </h2>

          <p className="mb-8 leading-relaxed text-slate-600">
            A página que procura não existe.
            <br />
            Pode ter sido movida ou removida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-[background-color,box-shadow,transform] duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
