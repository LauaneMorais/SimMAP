"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  Crown,
  Eye,
  EyeOff,
  Network,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import type { Member } from "@/lib/types";

interface OrganogramSectionProps {
  members: Member[];
}

interface LeadershipMember {
  member: Member;
  role: string;
}

interface NodeGroup {
  title: string;
  members: LeadershipMember[];
}

interface OrganogramNode {
  id: string;
  name: string;
  type: "corp" | "diretoria";
  groups: NodeGroup[];
  effectiveMembers: Member[];
  note: string;
}

const DIRECTORATE_ORDER = [
  "CORP",
  "Adm",
  "Projetos",
  "Ensino",
  "Eventos",
  "RH",
  "Marketing",
];

const CARD_STYLES = [
  "from-[#25103a] via-[#16111f] to-[#09111f]",
  "from-[#12263f] via-[#121220] to-[#17101f]",
  "from-[#2f1824] via-[#151220] to-[#0d171b]",
  "from-[#28161a] via-[#11141e] to-[#141012]",
];

function normalizeStatus(status?: string | null) {
  return status?.trim().toLowerCase() ?? "";
}

function sortByName(a: Member, b: Member) {
  return a.nome.localeCompare(b.nome, "pt-BR");
}

function roleLabel(status?: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "presidente") {
    return "Presidente";
  }

  if (normalized === "vice-presidente") {
    return "Vice-presidente";
  }

  if (normalized === "diretor") {
    return "Diretor";
  }

  return "Membro efetivo";
}

function MemberPill({
  member,
  role,
  accent = "default",
}: {
  member: Member;
  role: string;
  accent?: "default" | "institutional";
}) {
  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur ${
        accent === "institutional"
          ? "border-amber-300/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(255,255,255,0.04))]"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{member.nome}</p>
          <p className="mt-1 text-xs text-white/60">
            {member.curso ?? "Curso nao informado"}
          </p>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
          {role}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {member.periodo ? (
          <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/65">
            {member.periodo}o periodo
          </span>
        ) : null}
        {member.maturidade ? (
          <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/65">
            {member.maturidade.split(" ")[0]}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-black/15 px-4 py-6 text-sm text-white/55">
      {text}
    </div>
  );
}

function GraphNodeCard({
  node,
  active,
  onClick,
}: {
  node: OrganogramNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.75rem] border p-5 text-left transition-all ${
        active
          ? "border-primary/40 bg-primary/12 shadow-[0_20px_80px_rgba(168,85,247,0.22)]"
          : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/6"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
            {node.type === "corp" ? "Nucleo central" : "Diretoria"}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{node.name}</h3>
        </div>
        <Badge className="border-white/10 bg-white/8 text-white">
          {node.groups.reduce((total, group) => total + group.members.length, 0) +
            node.effectiveMembers.length}{" "}
          pessoas
        </Badge>
      </div>

      <div className="mt-4 space-y-4">
        {node.groups.map((group) => (
          <div key={`${node.id}-${group.title}`}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              {group.title}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.members.map(({ member, role }) => (
                <span
                  key={`${node.id}-${group.title}-${member.id}`}
                  className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-white/80"
                >
                  {member.nome} · {role}
                </span>
              ))}
            </div>
          </div>
        ))}

        {node.effectiveMembers.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
              Membros efetivos
            </p>
            <div className="flex flex-wrap gap-2">
              {node.effectiveMembers.map((member) => (
                <span
                  key={`${node.id}-${member.id}-member`}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70"
                >
                  {member.nome}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

export function OrganogramSection({ members }: OrganogramSectionProps) {
  const nodes = useMemo<OrganogramNode[]>(() => {
    const corpLeaders = members
      .filter((member) => {
        const status = normalizeStatus(member.status);
        return status === "presidente" || status === "vice-presidente";
      })
      .map((member) => ({
        member,
        role: roleLabel(member.status),
      }))
      .sort((a, b) => sortByName(a.member, b.member));

    const secretaries = members
      .filter((member) => member.areasAtuacao.includes("Secr.Geral"))
      .map((member) => ({
        member,
        role: "Secretário",
      }))
      .sort((a, b) => sortByName(a.member, b.member));

    const directorates = DIRECTORATE_ORDER.filter((name) => name !== "CORP")
      .map((name) => {
        const assignedMembers = members
          .filter((member) => member.areasAtuacao.includes(name))
          .sort(sortByName);

        const director =
          assignedMembers.find((member) => normalizeStatus(member.status) === "diretor") ??
          null;

        const effectiveMembers = assignedMembers.filter(
          (member) => member.id !== director?.id
        );

        return {
          id: name.toLowerCase(),
          name,
          type: "diretoria" as const,
          groups: director
            ? [
                {
                  title: "Diretor",
                  members: [
                    {
                      member: director,
                      role: "Diretor",
                    },
                  ],
                },
              ]
            : [],
          effectiveMembers,
          note:
            assignedMembers.length > 0
              ? "Todos os integrantes fora da liderança foram considerados membros efetivos desta diretoria."
              : "Diretoria sem membros vinculados na base atual.",
        };
      })
      .filter((node) => node.groups.length > 0 || node.effectiveMembers.length > 0);

    return [
      {
        id: "corp",
        name: "CORP",
        type: "corp" as const,
        groups: [
          {
            title: "Presidência",
            members: corpLeaders,
          },
          {
            title: "Secretário",
            members: secretaries,
          },
        ].filter((group) => group.members.length > 0),
        effectiveMembers: [],
        note:
          "O CORP foi consolidado com presidente, vice-presidente e secretário, sem um slide separado para secretaria.",
      },
      ...directorates,
    ];
  }, [members]);

  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGraph, setShowGraph] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateCurrent = () => {
      setCurrentIndex(api.selectedScrollSnap());
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    updateCurrent();
    api.on("select", updateCurrent);
    api.on("reInit", updateCurrent);

    return () => {
      api.off("select", updateCurrent);
      api.off("reInit", updateCurrent);
    };
  }, [api]);

  function handleSelect(nodeId: string) {
    const nextIndex = nodes.findIndex((node) => node.id === nodeId);
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
      api?.scrollTo(nextIndex);
    }
  }

  function handlePrev() {
    api?.scrollPrev();
  }

  function handleNext() {
    api?.scrollNext();
  }

  const corpNode = nodes[0];
  const directorateNodes = nodes.slice(1);

  if (!corpNode) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Organograma
        </h1>
        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Nenhum membro disponivel para montar o organograma.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <Network className="h-3.5 w-3.5" />
            Árvore Organizacional
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowGraph((current) => !current)}
            className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 hover:bg-white/8"
          >
            {showGraph ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Ocultar grafo
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Exibir grafo
              </>
            )}
          </Button>
        </div>
        <div className="space-y-3">
          <h1 className="w-full text-4xl font-semibold tracking-tight text-white md:text-5xl xl:text-6xl">
            Organograma em árvore com navegação por diretoria
          </h1>
          <p className="w-full text-sm leading-6 text-muted-foreground md:text-base lg:max-w-4xl">
            O núcleo institucional aparece no topo e as diretorias se conectam
            abaixo. Cada card pode ser usado como atalho para abrir os detalhes da
            área correspondente no slider.
          </p>
        </div>
      </div>

      {showGraph ? (
        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(8,11,18,0.97),rgba(28,10,41,0.92))]">
          <CardContent className="relative p-6 md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_24%)]" />
            <div className="relative space-y-8">
              <div className="mx-auto max-w-2xl">
                <GraphNodeCard
                  node={corpNode}
                  active={currentIndex === 0}
                  onClick={() => handleSelect(corpNode.id)}
                />
              </div>

              <div className="hidden flex-col items-center md:flex">
                <div className="h-10 w-px bg-gradient-to-b from-primary/80 to-primary/20" />
                <div className="h-px w-[min(100%,68rem)] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {directorateNodes.map((node, index) => (
                  <div key={node.id} className="relative">
                    <div className="absolute left-1/2 top-0 hidden h-6 w-px -translate-x-1/2 bg-gradient-to-b from-primary/30 to-transparent md:block" />
                    <div className="pt-0 md:pt-6">
                      <GraphNodeCard
                        node={node}
                        active={currentIndex === index + 1}
                        onClick={() => handleSelect(node.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {nodes.map((node, index) => (
            <Button
              key={node.id}
              variant="ghost"
              onClick={() => handleSelect(node.id)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${
                index === currentIndex
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-white/10 bg-black/15 text-white/60 hover:bg-white/8"
              }`}
            >
              {node.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={!canScrollPrev}
            className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 hover:bg-white/8 disabled:opacity-40"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="ghost"
            onClick={handleNext}
            disabled={!canScrollNext}
            className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 hover:bg-white/8 disabled:opacity-40"
          >
            Próxima
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{ loop: false, align: "start" }}
        className="mx-auto w-full max-w-6xl"
      >
        <CarouselContent>
          {nodes.map((node, index) => (
            <CarouselItem key={node.id}>
              <Card
                className={`overflow-hidden border-white/10 bg-gradient-to-br ${CARD_STYLES[index % CARD_STYLES.length]} shadow-[0_40px_120px_rgba(0,0,0,0.35)]`}
              >
                <CardContent className="relative p-6 md:p-8">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_30%)]" />
                  <div className="relative space-y-8">
                    <div
                      className={`grid gap-6 ${
                        node.effectiveMembers.length > 0
                          ? "lg:grid-cols-[0.9fr_1.1fr]"
                          : "lg:grid-cols-1"
                      }`}
                    >
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className="border-white/10 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                            {node.type === "corp" ? "Nucleo institucional" : "Diretoria"}
                          </Badge>
                          <Badge className="border-primary/30 bg-primary/12 px-3 py-1 text-xs text-primary">
                            {node.groups.reduce((total, group) => total + group.members.length, 0) +
                              node.effectiveMembers.length}{" "}
                            pessoas
                          </Badge>
                        </div>
                        <div>
                          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            {node.name}
                          </h2>
                          <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">
                            {node.note}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/60">
                            {node.type === "corp" ? (
                              <Crown className="h-4 w-4 text-amber-300" />
                            ) : (
                              <BriefcaseBusiness className="h-4 w-4 text-primary" />
                            )}
                            Liderança
                          </div>
                          <div className="space-y-3">
                            {node.groups.length > 0 ? (
                              node.groups.map((group) => (
                                <div key={`${node.id}-${group.title}`} className="space-y-3">
                                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                                    {group.title}
                                  </div>
                                  {group.members.map(({ member, role }) => (
                                    <MemberPill
                                      key={`${node.id}-${group.title}-${member.id}`}
                                      member={member}
                                      role={role}
                                      accent={node.type === "corp" ? "institutional" : "default"}
                                    />
                                  ))}
                                </div>
                              ))
                            ) : (
                              <EmptyState text="Nenhuma liderança definida nesta frente." />
                            )}
                          </div>
                        </div>
                      </div>

                      {node.effectiveMembers.length > 0 ? (
                        <div className="rounded-[2rem] border border-white/10 bg-black/18 p-5 md:p-6">
                          <div className="mb-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/60">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              Membros Efetivos
                            </div>
                            <span className="text-xs text-white/45">
                              {node.effectiveMembers.length} integrantes
                            </span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {node.effectiveMembers.map((member) => (
                              <MemberPill
                                key={`${node.id}-${member.id}-effective`}
                                member={member}
                                role="Membro efetivo"
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 top-auto bottom-3 translate-y-0 border-white/10 bg-black/45 text-white hover:bg-black/60 md:-left-12 md:top-1/2 md:bottom-auto md:-translate-y-1/2" />
        <CarouselNext className="right-3 top-auto bottom-3 translate-y-0 border-white/10 bg-black/45 text-white hover:bg-black/60 md:-right-12 md:top-1/2 md:bottom-auto md:-translate-y-1/2" />
      </Carousel>
    </section>
  );
}
