import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { MemberProfileContent } from "@/components/member-profile-content";
import { MemberServiceError, getMemberBySlug } from "@/lib/services/member-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let member;

  try {
    member = await getMemberBySlug(id);
  } catch (error) {
    if (error instanceof MemberServiceError && error.status === 404) {
      notFound();
    }

    throw error;
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
