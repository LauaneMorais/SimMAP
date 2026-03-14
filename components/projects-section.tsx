"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import {
  AlertCircle,
  Clock3,
  Folder,
  FolderKanban,
  Rocket,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DashboardAnalyses, Member, Project } from "@/lib/types";

interface ProjectsSectionProps {
  members: Member[];
  projects: Project[];
  analyses: DashboardAnalyses;
}

const COLORS = [
  "#a855f7",
  "#c084fc",
  "#d8b4fe",
  "#8b5cf6",
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",
  "#4c1d95",
];

function truncateLabel(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function getPriorityColors(index: number) {
  const colors = [
    {
      badge: "bg-red-500/20 text-red-400 border-red-500/30",
      card: "border-red-500/30 bg-red-500/5 hover:border-red-500/50 hover:bg-red-500/10",
    },
    {
      badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      card: "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10",
    },
    {
      badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      card: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 hover:bg-blue-500/10",
    },
  ];

  return colors[Math.min(index, colors.length - 1)];
}

function getMaturidadeLabel(maturidade?: string | null): string {
  if (!maturidade) {
    return "Sem maturidade";
  }

  if (maturidade.toLowerCase().includes("em desenvolvimento")) {
    return "Em desenvolvimento";
  }

  return maturidade.split(" ")[0];
}

function getMaturidadeBadgeClass(maturidade?: string | null): string {
  const level = maturidade?.split(" ")[0].toLowerCase();

  switch (level) {
    case "mentor":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "autônomo":
    case "autonomo":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "em":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "iniciante":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default:
      return "bg-primary/20 text-primary border-primary/30";
  }
}

function formatTechnicalScore(score: number | null) {
  return typeof score === "number" ? score.toFixed(1) : "Sem nota";
}

export function ProjectsSection({
  members,
  projects,
  analyses,
}: ProjectsSectionProps) {
  const isMobile = useIsMobile();

  const membersBySlug = useMemo(
    () => new Map(members.map((member) => [member.slug, member])),
    [members]
  );

  const activeProjects = useMemo(
    () => projects.filter((project) => project.isActive).sort((a, b) => b.teamSize - a.teamSize),
    [projects]
  );

  const projectStats = useMemo(
    () =>
      activeProjects.map((project) => ({
        label:
          project.nome.length > 28 ? `${project.nome.slice(0, 28)}...` : project.nome,
        fullName: project.nome,
        value: project.teamSize,
      })),
    [activeProjects]
  );

  const statusSummary = useMemo(() => {
    return projects.reduce<Record<string, number>>((acc, project) => {
      const key = project.status ?? "Sem status";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  const prioritySummary = useMemo(() => {
    return projects.reduce<Record<string, number>>((acc, project) => {
      if (!project.prioridade || project.prioridade === "Não se aplica") {
        return acc;
      }

      acc[project.prioridade] = (acc[project.prioridade] || 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  const futureProjectsStats = analyses.interestProjects.slice(0, 8);

  const membersByProjectCount = useMemo(() => {
    return members.reduce<Record<number, Member[]>>((acc, member) => {
      const count = Math.min(member.projetosAtuais.length, 2);

      if (!acc[count]) {
        acc[count] = [];
      }

      acc[count].push(member);
      return acc;
    }, {});
  }, [members]);

  const sortedCounts = useMemo(() => {
    return Object.keys(membersByProjectCount)
      .map(Number)
      .sort((a, b) => a - b);
  }, [membersByProjectCount]);

  const placementCandidates = useMemo(() => {
    const availabilityWeight = (value: string | null) => {
      const text = value?.toLowerCase() ?? "";
      if (text.includes("9 a 12") || text.includes("mais")) return 3;
      if (text.includes("6 a 8")) return 2;
      if (text.includes("menos")) return 1;
      return 0;
    };

    return members
      .filter((member) => member.projetosAtuais.length === 0)
      .sort((a, b) => {
        const noteDiff = (b.notaTecnica ?? -1) - (a.notaTecnica ?? -1);
        if (noteDiff !== 0) {
          return noteDiff;
        }

        const availabilityDiff =
          availabilityWeight(b.disponibilidade) - availabilityWeight(a.disponibilidade);
        if (availabilityDiff !== 0) {
          return availabilityDiff;
        }

        return a.nome.localeCompare(b.nome, "pt-BR");
      })
      .slice(0, 9);
  }, [members]);

  const stalledProjectsCount =
    (statusSummary["Suspenso"] || 0) + (statusSummary["Não iniciado"] || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-primary" />
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          Análise de Projetos
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/20 p-3">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              <p className="text-sm text-muted-foreground">Projetos mapeados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-green-500/10 to-transparent backdrop-blur">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/20 p-3">
              <FolderKanban className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {statusSummary["Em andamento"] || 0}
              </p>
              <p className="text-sm text-muted-foreground">Em andamento</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-cyan-500/10 to-transparent backdrop-blur">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-cyan-500/20 p-3">
              <Users className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {members.filter((member) => member.projetosAtuais.length > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Membros alocados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-orange-500/10 to-transparent backdrop-blur">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-orange-500/20 p-3">
              <AlertCircle className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stalledProjectsCount}</p>
              <p className="text-sm text-muted-foreground">Suspensos ou não iniciados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-12 2xl:gap-5">
        <Card className="border-primary/20 bg-card/50 backdrop-blur md:col-span-2 lg:col-span-6 xl:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Folder className="h-5 w-5 text-primary" />
              Times por Projeto em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Integrantes", color: "#a855f7" } }}
              className="h-[320px] w-full sm:h-[360px] lg:h-[400px] xl:h-[430px] 2xl:h-[480px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectStats}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: isMobile ? 12 : 30,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" stroke="#94a3b8" fontSize={isMobile ? 10 : 12} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    stroke="#94a3b8"
                    width={isMobile ? 112 : 196}
                    tickFormatter={(value) =>
                      truncateLabel(String(value), isMobile ? 18 : 28)
                    }
                    interval={0}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#9c2ee0",
                      border: "1px solid #2f0a4b",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number, _: string, item: { payload?: { fullName?: string } }) => [
                      `${value} integrantes`,
                      item.payload?.fullName ?? "Projeto",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {projectStats.map((_, index) => (
                      <Cell key={`project-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-6 space-y-4">
              {activeProjects.map((project) => {
                const responsavel =
                  (project.responsavelSlug
                    ? membersBySlug.get(project.responsavelSlug)?.nome
                    : null) ?? project.responsavel ?? "Sem responsável";

                return (
                  <div
                    key={project.slug}
                    className="rounded-2xl border border-border/50 bg-secondary/30 p-4"
                  >
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{project.nome}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Responsável: {responsavel}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {project.teamSize} {project.teamSize === 1 ? "integrante" : "integrantes"}
                        </Badge>
                        {project.prioridade ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                          >
                            Prioridade {project.prioridade}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>Início: {project.dataInicio ?? "Não informado"}</span>
                      <span>Encerramento: {project.dataEncerramento ?? "Não informado"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.time.map((memberName, index) => (
                        <div
                          key={`${project.slug}-${memberName}-${index}`}
                          className="flex items-center gap-2 rounded-full bg-background/50 px-3 py-1 text-sm"
                        >
                          <span className="text-foreground">
                            {membersBySlug.get(project.timeSlugs[index] ?? "")?.nome ??
                              memberName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:col-span-2 lg:col-span-6 xl:col-span-4">
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Rocket className="h-5 w-5 text-primary" />
                Interesse em Projetos Futuros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ value: { label: "Interessados", color: "#a855f7" } }}
                className="h-[300px] w-full sm:h-[320px] xl:h-[340px] 2xl:h-[380px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={futureProjectsStats}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: isMobile ? 12 : 20,
                      left: 10,
                      bottom: 5,
                    }}
                  >
                    <XAxis type="number" stroke="#94a3b8" fontSize={isMobile ? 10 : 12} />
                    <YAxis
                      dataKey="label"
                      type="category"
                      stroke="#94a3b8"
                      width={isMobile ? 116 : 180}
                      tickFormatter={(value) =>
                        truncateLabel(String(value), isMobile ? 18 : 24)
                      }
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#9c2ee0",
                        border: "1px solid #2f0a4b",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value: number) => [`${value} interessados`, "Projeto"]}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {futureProjectsStats.map((_, index) => (
                        <Cell key={`interest-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock3 className="h-5 w-5 text-primary" />
                Prioridade Oficial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(prioritySummary).length > 0 ? (
                Object.entries(prioritySummary).map(([priority, count]) => (
                  <div
                    key={priority}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 px-4 py-3"
                  >
                    <span className="text-sm text-foreground">{priority}</span>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {count}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum projeto com prioridade explícita na base atual.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <Star className="h-6 w-6 text-primary" />
            Radar para Novos Projetos
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {sortedCounts.map((projectCount, index) => {
            const priorityLevel = index + 1;
            const groupMembers = membersByProjectCount[projectCount];
            const colors = getPriorityColors(index);

            let groupLabelText = "";
            if (projectCount === 0) {
              groupLabelText = `Sem projetos atuais (${groupMembers.length})`;
            } else if (projectCount === 1) {
              groupLabelText = `Atuando em 1 projeto (${groupMembers.length})`;
            } else {
              groupLabelText = `Atuando em 2 ou mais projetos (${groupMembers.length})`;
            }

            return (
              <div key={`priority-${priorityLevel}`}>
                <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <Badge className={`border px-3 py-1 text-sm font-bold ${colors.badge}`}>
                    Prioridade {priorityLevel}
                  </Badge>
                  <span className="text-base font-medium text-muted-foreground">
                    {groupLabelText}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupMembers.map((member) => (
                    <div
                      key={member.slug}
                      className={`rounded-xl border p-4 transition-all ${colors.card}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-lg font-bold text-foreground">
                          {member.nome.trim()}
                        </span>
                        {!member.respondeuForms ? (
                          <Badge
                            variant="outline"
                            className="border-amber-400/20 bg-amber-400/10 text-amber-200"
                          >
                            Sem Forms
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 text-sm ${getMaturidadeBadgeClass(member.maturidade)}`}
                        >
                          {getMaturidadeLabel(member.maturidade)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-white/10 bg-black/10 px-2.5 py-0.5 text-sm text-white/80"
                        >
                          Nota {formatTechnicalScore(member.notaTecnica)}
                        </Badge>
                      </div>

                      <p className="mb-3 text-sm text-muted-foreground">
                        Disponibilidade: {member.disponibilidade ?? "Não informada"}
                      </p>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {member.projetosAtuais.map((project) => (
                          <Badge
                            key={`${member.slug}-${project}`}
                            variant="outline"
                            className="border-border bg-secondary/50 px-2.5 py-0.5 text-sm text-foreground"
                          >
                            {project}
                          </Badge>
                        ))}
                        {member.projetosAtuais.length === 0 ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-sm text-emerald-200"
                          >
                            Sem projeto atual
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {member.projetosInteresse.slice(0, 3).map((project) => (
                          <span
                            key={`${member.slug}-interest-${project}`}
                            className="rounded-md bg-primary/20 px-2.5 py-1 text-sm font-semibold text-primary"
                          >
                            {project}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
