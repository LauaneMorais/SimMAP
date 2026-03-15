"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  FolderOpen,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Member, Project } from "@/lib/types";

interface ProjectsGalleryProps {
  projects: Project[];
  members: Member[];
}

type SortOption = "activity" | "team" | "name";

const ALL_FILTER = "__all__";

function normalizeStatus(status: string | null) {
  return status ?? "Sem status";
}

function normalizeForSearch(value: string | null | undefined) {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function statusClasses(status: string | null) {
  switch (status?.toLowerCase()) {
    case "em andamento":
      return "border-emerald-400/30 bg-emerald-400/12 text-emerald-200";
    case "finalizado":
      return "border-sky-400/30 bg-sky-400/12 text-sky-200";
    case "suspenso":
      return "border-amber-400/30 bg-amber-400/12 text-amber-100";
    case "não iniciado":
    case "nao iniciado":
      return "border-fuchsia-400/30 bg-fuchsia-400/12 text-fuchsia-100";
    default:
      return "border-border/60 bg-secondary/60 text-foreground";
  }
}

function priorityClasses(priority: string | null) {
  switch (priority?.toLowerCase()) {
    case "alta":
      return "border-rose-400/30 bg-rose-400/12 text-rose-100";
    case "média":
    case "media":
      return "border-orange-400/30 bg-orange-400/12 text-orange-100";
    case "baixa":
      return "border-cyan-400/30 bg-cyan-400/12 text-cyan-100";
    default:
      return "border-border/60 bg-secondary/50 text-muted-foreground";
  }
}

function sortProjects(a: Project, b: Project, sort: SortOption) {
  if (sort === "team") {
    return b.teamSize - a.teamSize || a.nome.localeCompare(b.nome, "pt-BR");
  }

  if (sort === "name") {
    return a.nome.localeCompare(b.nome, "pt-BR");
  }

  const aScore = Number(a.isActive) * 10 + a.teamSize;
  const bScore = Number(b.isActive) * 10 + b.teamSize;
  return bScore - aScore || a.nome.localeCompare(b.nome, "pt-BR");
}

export function ProjectsGallery({ projects, members }: ProjectsGalleryProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [priorityFilter, setPriorityFilter] = useState(ALL_FILTER);
  const [sortBy, setSortBy] = useState<SortOption>("activity");
  const deferredSearch = useDeferredValue(search);

  const membersBySlug = useMemo(
    () => new Map(members.map((member) => [member.slug, member])),
    [members]
  );

  const availableStatuses = useMemo(
    () =>
      Array.from(
        new Set(projects.map((project) => normalizeStatus(project.status)))
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [projects]
  );

  const availablePriorities = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((project) => project.prioridade)
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return projects
      .filter((project) => {
        const matchesSearch =
          query.length === 0 ||
          project.nome.toLowerCase().includes(query) ||
          (project.responsavel ?? "").toLowerCase().includes(query) ||
          project.time.some((member) => member.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === ALL_FILTER ||
          normalizeStatus(project.status) === statusFilter;

        const matchesPriority =
          priorityFilter === ALL_FILTER ||
          (project.prioridade ?? "Sem prioridade") === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => sortProjects(a, b, sortBy));
  }, [deferredSearch, priorityFilter, projects, sortBy, statusFilter]);

  const summary = useMemo(() => {
    const uniqueMembers = new Set<string>();

    for (const project of projects) {
      for (const slug of project.timeSlugs) {
        if (slug) {
          uniqueMembers.add(slug);
        }
      }
    }

    const activeCount = projects.filter((project) => project.isActive).length;
    const syntheticCount = projects.filter((project) => {
      return (
        !project.dataInicio &&
        !project.dataEncerramento &&
        !project.prioridade &&
        !project.responsavel
      );
    }).length;

    return {
      total: projects.length,
      active: activeCount,
      allocatedMembers: uniqueMembers.size,
      synthetic: syntheticCount,
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(34,211,238,0.08),rgba(10,10,20,0.96))] p-6 shadow-[0_24px_80px_rgba(88,28,135,0.28)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_24%)]" />
        <div className="absolute right-0 top-0 h-48 w-48 translate-x-1/4 -translate-y-1/4 rounded-full border border-white/10 bg-white/5 blur-2xl" />
        <div className="relative">
          <div className="space-y-5">
            <div className="space-y-3">
              <h1 className="max-w-full text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-5xl">
                Projetos da LAWD
              </h1>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/45">Projetos</p>
                <p className="mt-2 text-3xl font-semibold text-white">{summary.total}</p>
              </div>
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-500/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-emerald-100/60">
                  Em andamento
                </p>
                <p className="mt-2 text-3xl font-semibold text-emerald-50">{summary.active}</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-cyan-100/60">
                  Pessoas alocadas
                </p>
                <p className="mt-2 text-3xl font-semibold text-cyan-50">
                  {summary.allocatedMembers}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="border-primary/20 bg-card/60 backdrop-blur">
        <CardHeader className="gap-4">
          <div>
            <CardTitle className="text-xl">Explorador de projetos</CardTitle>
            <CardDescription>
              Filtre por nome, status e prioridade para encontrar rapidamente um projeto.
            </CardDescription>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(3,minmax(0,0.7fr))]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por projeto, responsável ou integrante"
                className="h-11 border-border/60 bg-background/40 pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full border-border/60 bg-background/40">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>Todos os status</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-11 w-full border-border/60 bg-background/40">
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>Todas as prioridades</SelectItem>
                {availablePriorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="h-11 w-full border-border/60 bg-background/40">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activity">Atividade</SelectItem>
                <SelectItem value="team">Tamanho do time</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filteredProjects.map((project) => {
          const responsavel =
            (project.responsavelSlug
              ? membersBySlug.get(project.responsavelSlug)?.nome
              : null) ?? project.responsavel;
          const isFormsOnly =
            !project.responsavel &&
            !project.prioridade &&
            !project.dataInicio &&
            !project.dataEncerramento;

          const isNotStarted =
            project.status?.toLowerCase() === "não iniciado" ||
            project.status?.toLowerCase() === "nao iniciado";

          const interestedMembers = isNotStarted
            ? members
                .filter((m) =>
                  m.projetosInteresse?.some((p) => {
                    const normalizedP = normalizeForSearch(p);
                    return (
                      normalizedP === normalizeForSearch(project.nome) ||
                      (project.nomeOriginal && normalizedP === normalizeForSearch(project.nomeOriginal)) ||
                      (project.slug && normalizedP === project.slug.replace(/-/g, ""))
                    );
                  })
                )
                .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
            : [];

          return (
            <Card
              key={project.slug}
              className="group overflow-hidden border-border/50 bg-[linear-gradient(180deg,rgba(26,26,38,0.92),rgba(18,18,28,0.98))] transition-transform duration-300 hover:-translate-y-1 hover:border-primary/30"
            >
              <div className="h-1 w-full bg-[linear-gradient(90deg,rgba(34,211,238,0.0),rgba(168,85,247,0.9),rgba(34,211,238,0.7))]" />
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={statusClasses(project.status)}>
                        {normalizeStatus(project.status)}
                      </Badge>
                      {project.prioridade ? (
                        <Badge variant="outline" className={priorityClasses(project.prioridade)}>
                          Prioridade {project.prioridade}
                        </Badge>
                      ) : null}
                      {isFormsOnly ? (
                        <Badge
                          variant="outline"
                          className="border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-100"
                        >
                          Mapeado pelo Forms
                        </Badge>
                      ) : null}
                    </div>
                    <CardTitle className="text-2xl leading-tight">{project.nome}</CardTitle>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/15">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/50 bg-background/30 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground text-ellipsis overflow-hidden">
                      Responsável
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                      {responsavel ?? "Não informado"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-background/30 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground text-ellipsis overflow-hidden">
                      Integrantes
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">{project.teamSize}</p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-background/30 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground text-ellipsis overflow-hidden">
                      Fase
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                      {project.isActive ? "Operação" : "Planejamento / histórico"}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      Início
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {project.dataInicio ?? "Não informado"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldAlert className="h-4 w-4" />
                      Encerramento
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {project.dataEncerramento ?? "Sem previsão"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Equipe
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pessoas vinculadas ao projeto
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/15 text-primary">
                      {project.teamSize} {project.teamSize === 1 ? "membro" : "membros"}
                    </Badge>
                  </div>

                  {project.time.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {project.time.map((memberName, index) => {
                        const slug = project.timeSlugs[index];
                        const label = slug
                          ? membersBySlug.get(slug)?.nome ?? memberName
                          : memberName;

                        if (!slug) {
                          return (
                            <span
                              key={`${project.slug}-${memberName}-${index}`}
                              className="inline-flex items-center rounded-full border border-border/60 bg-background/35 px-3 py-1.5 text-sm text-foreground"
                            >
                              {label}
                            </span>
                          );
                        }

                        return (
                          <Link
                            key={`${project.slug}-${memberName}-${index}`}
                            href={`/membros/${slug}`}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/15"
                          >
                            {label}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-background/20 px-4 py-5 text-sm text-muted-foreground">
                      Nenhum integrante informado até o momento.
                    </div>
                  )}
                </div>

                {isNotStarted && (
                  <Collapsible className="space-y-3 pt-3 border-t border-border/40">
                    <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl border border-border/40 bg-secondary/20 p-3 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3 text-left">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Membros que desejam participar
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Interesse Registrado
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-fuchsia-400/10 text-fuchsia-400">
                          {interestedMembers.length}
                        </Badge>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      {interestedMembers.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {interestedMembers.map((m) => (
                            <Link
                              key={`interest-${project.slug}-${m.slug}`}
                              href={`/membros/${m.slug}`}
                              className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1.5 text-sm text-fuchsia-300 transition-colors hover:bg-fuchsia-400/15"
                            >
                              {m.nome}
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 rounded-2xl border border-dashed border-border/60 bg-background/20 px-4 py-5 text-sm text-muted-foreground">
                          Nenhum registro de interesse até o momento.
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="border-border/60 bg-card/50">
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full border border-border/60 bg-secondary/30 p-4">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">
                Nenhum projeto encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                Ajuste os filtros ou refine a busca para encontrar outro projeto.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
