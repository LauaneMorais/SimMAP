import { Header } from "@/components/header";
import { OrganogramSection } from "@/components/organogram-section";
import { getDashboardData } from "@/lib/services/member-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OrganogramaPage() {
  const { members } = await getDashboardData();

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
