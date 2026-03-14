"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleDashed,
  FileSearch,
  GraduationCap,
  Layers3,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMemberPhoto } from "@/lib/member-media";
import type { Member } from "@/lib/types";

interface MemberProfileContentProps {
  member: Member;
  mode?: "page" | "modal";
  showPageLink?: boolean;
}

function getDisplayNames(member: Member) {
  const fullName = member.nomeOriginal || member.nome;
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return { fullName, shortName: fullName };
  }

  return {
    fullName,
    shortName: `${parts[0]} ${parts[parts.length - 1]}`,
  };
}

function renderList(items: string[], emptyLabel = "Não informado") {
  if (items.length === 0) {
    return (
      <span className="rounded-full border border-dashed border-border/60 px-3 py-1 text-sm text-muted-foreground">
        {emptyLabel}
      </span>
    );
  }

  return items.map((item) => (
    <span
      key={item}
      className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary"
    >
      {item}
    </span>
  ));
}

function renderParagraphs(items: string[], emptyLabel: string) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return items.map((item) => (
    <p key={item} className="text-sm leading-6 text-white/80">
      {item}
    </p>
  ));
}

function formatTechnicalScore(score: number | null) {
  return typeof score === "number" ? `${score.toFixed(1)}/10` : "Sem nota";
}

export function MemberProfileContent({
  member,
  mode = "page",
  showPageLink = false,
}: MemberProfileContentProps) {
  const isModal = mode === "modal";
  const imageSrc = getMemberPhoto(member);
  const { fullName, shortName } = getDisplayNames(member);
  const title = isModal ? shortName : member.nome;

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-6 ${
          isModal ? "grid-cols-1" : "xl:grid-cols-[0.8fr_1.2fr]"
        }`}
      >
        {!isModal ? (
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.16))]">
            <CardContent className="p-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={member.nome}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 30vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-white/10 bg-white/10 text-white">
                      {member.status ?? "Membro"}
                    </Badge>
                    {member.areasAtuacao.map((area) => (
                      <Badge
                        key={area}
                        className="border-primary/30 bg-primary/12 text-primary"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Perfil do Membro
              </div>
              <Badge
                className={
                  member.respondeuForms
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-amber-400/20 bg-amber-400/10 text-amber-200"
                }
              >
                {member.respondeuForms ? "Dados conciliados do Forms" : "Sem resposta no Forms"}
              </Badge>
              {isModal ? (
                <>
                  <Badge className="border-white/10 bg-white/10 text-white">
                    {member.status ?? "Membro"}
                  </Badge>
                  {member.areasAtuacao.map((area) => (
                    <Badge
                      key={area}
                      className="border-primary/30 bg-primary/12 text-primary"
                    >
                      {area}
                    </Badge>
                  ))}
                </>
              ) : null}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2
                  className={`font-semibold tracking-tight text-white ${
                    isModal ? "text-3xl sm:text-4xl xl:text-5xl" : "text-4xl xl:text-5xl"
                  }`}
                >
                  {title}
                </h2>
                {showPageLink ? (
                  <Link
                    href={`/membros/${member.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70"
                  >
                    Abrir página
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
                Perfil consolidado a partir do mapeamento da LAWD, com conciliação entre Notion, projetos oficiais e respostas do Forms.
              </p>
            </div>
          </div>

          {!member.respondeuForms ? (
            <Card className="border-amber-400/20 bg-amber-400/8">
              <CardContent className="flex items-start gap-3 p-4">
                <FileSearch className="mt-0.5 h-5 w-5 text-amber-200" />
                <div>
                  <p className="text-sm font-semibold text-amber-100">
                    Perfil parcial
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-50/80">
                    Este membro existe na base oficial, mas não teve resposta do Forms conciliada no pipeline atual. Os campos analíticos podem aparecer vazios.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-white/10 bg-black/20 sm:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Nome Completo
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {fullName}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Formação
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {member.curso ?? "Não informado"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {member.periodo ? `${member.periodo}º período` : "Período não informado"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  Atuação
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {member.disponibilidade ?? "Disponibilidade não informada"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {member.maturidade ?? "Maturidade não informada"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Jornada na Liga
                </div>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <p>Entrada: {member.entrada ?? "Não informada"}</p>
                  <p>Tempo de liga: {member.tempoLiga ?? "Não informado"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  Sinais do Forms
                </div>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <p>Nota técnica: {formatTechnicalScore(member.notaTecnica)}</p>
                  <p>Última resposta: {member.dataResposta ?? "Sem registro"}</p>
                  <p>Aniversário: {member.aniversario ?? "Não informado"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Tecnologias
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.techs)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Áreas de Interesse
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.areasInteresse)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Carreira
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.carreira)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Atributos Pessoais
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.atributos, "Sem atributos declarados")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Projetos Atuais
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.projetosAtuais, "Sem projetos atuais")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Projetos com Interesse
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.projetosInteresse, "Sem interesses registrados")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Projetos Coordenados
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.projetosCoordenados, "Sem coordenação registrada")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Projetos Finalizados
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.projetosFinalizados, "Sem projetos finalizados")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              Declarados no Forms
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {renderList(member.projetosDeclaradosForms, "Nenhum projeto declarado")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-white/10 bg-black/20 xl:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              <Lightbulb className="h-4 w-4 text-primary" />
              Objetivo na LAWD
            </div>
            <div className="mt-4 space-y-3">
              {renderParagraphs(
                member.objetivoLawd,
                "Nenhum objetivo declarado no Forms."
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              <Layers3 className="h-4 w-4 text-primary" />
              Projeto Pessoal
            </div>
            <div className="mt-4 space-y-3">
              <Badge
                className={
                  member.possuiProjetoPessoal
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-white/8 text-white/70"
                }
              >
                {member.possuiProjetoPessoal
                  ? "Possui projeto pessoal"
                  : "Sem projeto pessoal declarado"}
              </Badge>
              <p className="text-sm leading-6 text-white/80">
                {member.propostaProjetoPessoal ??
                  "Nenhuma proposta de projeto pessoal registrada."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
