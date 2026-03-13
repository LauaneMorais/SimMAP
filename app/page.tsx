"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { MemberSelector } from "@/components/member-selector";
import { StatsCharts } from "@/components/stats-charts";
import { ProjectsSection } from "@/components/projects-section";
import { Spinner } from "@/components/ui/spinner";
import { memberApi } from "@/lib/services/member-api";
import type { Member } from "@/lib/types";

export default function MapeamentoPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await memberApi.list();
        setMembers(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const apiMessage =
            typeof err.response?.data?.message === "string"
              ? err.response.data.message
              : null;

          setError(apiMessage ?? err.message);
          return;
        }

        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/20 p-4">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground">
              Erro ao carregar dados
            </p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative">
        <Header />

        <main className="container mx-auto space-y-8 px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Mapeamento de Perfis
            </h1>
            <p className="mt-2 text-xl text-pretty text-muted-foreground">
              Visualize os dados e habilidades dos membros da LAWD
            </p>
          </div>

          <MemberSelector
            members={members}
            selectedMember={selectedMember}
            onSelect={setSelectedMember}
          />

          <div className="flex items-center gap-4 py-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <StatsCharts members={members} />

          <div className="flex items-center gap-4 py-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              Projetos
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          <ProjectsSection members={members} />

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
