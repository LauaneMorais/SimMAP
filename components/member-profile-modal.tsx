"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { MemberProfileContent } from "@/components/member-profile-content";
import type { Member } from "@/lib/types";

interface MemberProfileModalProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberProfileModal({
  member,
  open,
  onOpenChange,
}: MemberProfileModalProps) {
  if (!member) {
    return null;
  }

  const fullName = member.nomeOriginal || member.nome;
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const shortName =
    parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : fullName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 top-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-[linear-gradient(180deg,rgba(12,15,24,0.985),rgba(18,11,30,0.985))] p-0 text-white md:left-1/2 md:top-1/2 md:h-[96dvh] md:w-[98vw] md:max-w-[110rem] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[2rem] md:border md:border-white/10 xl:max-w-[120rem]">
        <DialogTitle className="sr-only">Perfil de {shortName}</DialogTitle>
        <DialogDescription className="sr-only">
          Exibe os detalhes completos do perfil, áreas de atuação, projetos, métricas técnicas e respostas do Forms.
        </DialogDescription>
        <div className="h-full overflow-y-auto px-3 pb-5 pt-14 sm:px-5 md:px-8 md:pb-8 md:pt-12 xl:px-10">
          <MemberProfileContent member={member} mode="modal" showPageLink />
        </div>
      </DialogContent>
    </Dialog>
  );
}
