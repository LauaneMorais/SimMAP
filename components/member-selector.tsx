"use client";

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
import type { Member } from "@/lib/types";

interface MemberSelectorProps {
  members: Member[];
  selectedMember: Member | null;
  onSelect: (member: Member | null) => void;
}

export function MemberSelector({
  members,
  selectedMember,
  onSelect,
}: MemberSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
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
              className="w-full justify-between border-border/60 bg-secondary/50 hover:bg-secondary"
            >
              {selectedMember
                ? selectedMember.nome.trim()
                : "Escolha um membro..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Buscar membro..." />
              <CommandList>
                <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                <CommandGroup>
                  {members.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={member.nome}
                      className="group cursor-pointer"
                      onSelect={() => {
                        onSelect(
                          selectedMember?.id === member.id ? null : member
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedMember?.id === member.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{member.nome.trim()}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors">
                          {member.curso} • {member.periodo}º período
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
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  {selectedMember.nome.trim()}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onSelect(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Curso:</span>{" "}
                  <span className="text-foreground">{selectedMember.curso}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Período:</span>{" "}
                  <span className="text-foreground">
                    {selectedMember.periodo}º
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Disponibilidade:</span>{" "}
                  <span className="text-foreground">
                    {selectedMember.disponibilidade}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Carreira:</span>{" "}
                  <span className="text-foreground">
                    {selectedMember.carreira}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Maturidade:</span>{" "}
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-primary/20 text-primary"
                  >
                    {selectedMember.maturidade.split(" ")[0]}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">
                    Tecnologias:
                  </span>
                  <p className="text-foreground/80 text-xs leading-relaxed">
                    {selectedMember.tech}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Projetos Atuais:</span>{" "}
                  <span className="text-foreground">
                    {selectedMember.projetosAtuais}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Interesse em Projetos:
                  </span>{" "}
                  <span className="text-foreground">
                    {selectedMember.projetosFuturos}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
