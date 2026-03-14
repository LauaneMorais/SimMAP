"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberProfileModal } from "@/components/member-profile-modal";
import type { Member } from "@/lib/types";

interface MemberSelectorProps {
  members: Member[];
  selectedMember: Member | null;
  onSelect: (member: Member | null) => void;
}

function getMaturidadeLabel(maturidade?: string | null): string {
  if (!maturidade) {
    return "Nao informado";
  }

  if (maturidade.toLowerCase().includes("em desenvolvimento")) {
    return "Em Desenvolvimento";
  }

  return maturidade.split(" ")[0];
}

function formatList(items: string[], fallback = "Nao informado") {
  return items.length > 0 ? items.join(", ") : fallback;
}

export function MemberSelector({
  members,
  selectedMember,
  onSelect,
}: MemberSelectorProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6 text-primary" />
            Selecionar Membro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between border-border/60 bg-secondary/50 py-6 text-base hover:bg-secondary"
            >
              {selectedMember ? selectedMember.nome.trim() : "Escolha um membro..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(24rem,calc(100vw-2rem))] p-0">
            <Command>
              <CommandInput placeholder="Buscar membro..." className="text-base" />
                <CommandList>
                  <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                  <CommandGroup>
                    {members.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.nome}
                        className="group cursor-pointer py-3"
                        onSelect={() => {
                          onSelect(selectedMember?.id === member.id ? null : member);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-5 w-5",
                            selectedMember?.id === member.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="text-base">{member.nome.trim()}</span>
                          <span className="text-sm text-muted-foreground transition-colors group-hover:text-white/80">
                            {member.curso ?? "Curso nao informado"} •{" "}
                            {member.periodo ? `${member.periodo}º periodo` : "Periodo nao informado"}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedMember && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedMember.nome.trim()}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onSelect(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid gap-4 text-base">
                  <div>
                    <span className="text-muted-foreground">Curso:</span>{" "}
                    <span className="font-medium text-foreground">
                      {selectedMember.curso ?? "Nao informado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Período:</span>{" "}
                    <span className="font-medium text-foreground">
                      {selectedMember.periodo ? `${selectedMember.periodo}º` : "Nao informado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Disponibilidade:</span>{" "}
                    <span className="font-medium text-foreground">
                      {selectedMember.disponibilidade ?? "Nao informado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carreira:</span>{" "}
                    <span className="font-medium text-foreground">
                      {formatList(selectedMember.carreira)}
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      Maturidade:
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 px-2.5 py-0.5 text-sm text-primary"
                      >
                        {getMaturidadeLabel(selectedMember.maturidade)}
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="mb-1.5 block text-muted-foreground">
                      Tecnologias:
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-foreground/90">
                      {formatList(selectedMember.techs)}
                    </p>
                  </div>
                  <div>
                    <span className="mb-1 block text-muted-foreground">
                      Projetos Atuais:
                    </span>{" "}
                    <span className="font-medium text-foreground">
                      {formatList(selectedMember.projetosAtuais, "Nenhum")}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-muted-foreground">
                      Interesse em Projetos:
                    </span>{" "}
                    <span className="font-medium text-foreground">
                      {formatList(selectedMember.projetosInteresse, "Nenhum")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      onClick={() => setProfileOpen(true)}
                      className="rounded-full"
                    >
                      Ver em modal
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={`/membros/${selectedMember.id}`}>
                        Abrir página do membro
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MemberProfileModal
        member={selectedMember}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </>
  );
}
