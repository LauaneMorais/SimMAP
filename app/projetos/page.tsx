import type { Metadata } from "next";
import { Header } from "@/components/header";
import { ProjectsGallery } from "@/components/projects-gallery";
import { getDashboardData } from "@/lib/services/member-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projetos | SimMAP",
  description:
    "Visão detalhada dos projetos da LAWD com status, prioridade, responsáveis e equipe.",
};

export default async function ProjectsPage() {
  const data = await getDashboardData();

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[30rem] w-[30rem] rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/8 blur-3xl" />
      </div>

      <div className="relative">
        <Header />

        <main className="mx-auto w-full max-w-[1700px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 2xl:px-8">
          <div className="flex items-center gap-3 py-3 sm:gap-4 sm:py-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Projetos
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <ProjectsGallery projects={data.projects} members={data.members} />

          <footer className="mt-12 border-t border-border/40 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Mapa consolidado de projetos da{" "}
              <span className="font-semibold text-primary">LAWD</span> © 2026
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
