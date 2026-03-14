import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { getDashboardData } from "@/lib/services/member-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MapeamentoPage() {
  const data = await getDashboardData();

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative">
        <Header />

        <main className="mx-auto w-full max-w-[1700px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 2xl:px-8">
          <div className="flex items-center gap-3 py-3 sm:gap-4 sm:py-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <DashboardShell data={data} />

          <footer className="mt-12 border-t border-border/40 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Desenvolvido por{" "}
              <span className="font-semibold text-primary">LAWD</span> © 2026
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
