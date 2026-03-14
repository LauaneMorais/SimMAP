"use client";

import { Header } from "@/components/header";
import { OrganogramSection } from "@/components/organogram-section";
import { Spinner } from "@/components/ui/spinner";
import { useMembers } from "@/hooks/use-members";

export default function OrganogramaPage() {
  const { members, loading, error } = useMembers();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-muted-foreground">Montando organograma...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="max-w-md rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-lg font-medium text-foreground">
              Erro ao carregar organograma
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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
        <div className="absolute left-0 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative">
        <Header />
        <main className="container mx-auto space-y-8 px-4 py-8">
          <OrganogramSection members={members} />
        </main>
      </div>
    </div>
  );
}
