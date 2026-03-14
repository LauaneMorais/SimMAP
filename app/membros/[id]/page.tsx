"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { MemberProfileContent } from "@/components/member-profile-content";
import { Spinner } from "@/components/ui/spinner";
import { useMember } from "@/hooks/use-member";

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const memberId = Number(params.id);
  const { member, loading, error } = useMember(
    Number.isFinite(memberId) ? memberId : null
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <h1 className="text-2xl font-semibold text-white">
              Não foi possível carregar este membro
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error ?? "Membro não encontrado."}
            </p>
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
        <main className="container mx-auto px-4 py-10">
          <MemberProfileContent member={member} mode="page" />
        </main>
      </div>
    </div>
  );
}
