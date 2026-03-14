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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Folder, Users, Rocket, Star, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Member } from "@/lib/types";

interface ProjectsSectionProps {
  members: Member[];
}

interface PrioritizedMember extends Member {
  projetosList: string[];
}

const COLORS = ["#a855f7", "#c084fc", "#d8b4fe", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"];

function extractTechTags(techs: string[]): string[] {
  if (techs.length === 0) return [];

  const techAliases: Record<string, string> = {
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    html: "HTML",
    css: "CSS",
    sass: "Sass",
    vanilla: "Vanilla",
    react: "React",
    next: "Next.js",
    nextjs: "Next.js",
    "next.js": "Next.js",
    vue: "Vue",
    "vue.js": "Vue",
    angular: "Angular",
    "angular.js": "Angular",
    tailwind: "Tailwind",
    tailwindcss: "Tailwind",
    node: "Node.js",
    nodejs: "Node.js",
    "node.js": "Node.js",
    python: "Python",
    java: "Java",
    c: "C",
    "c++": "C++",
    "c#": "C#",
    php: "PHP",
    golang: "Golang",
    rust: "Rust",
    kotlin: "Kotlin",
    nest: "Nest",
    nestjs: "Nest",
    express: "Express",
    fastapi: "FastAPI",
    spring: "Spring",
    springboot: "Spring",
    django: "Django",
    postgresql: "PostgreSQL",
    postgres: "PostgreSQL",
    sql: "SQL",
    prisma: "Prisma",
    supabase: "Supabase",
    docker: "Docker",
    aws: "AWS",
    git: "Git",
    github: "GitHub",
    gitlab: "GitLab",
    flutter: "Flutter",
    figma: "Figma",
    photoshop: "Photoshop",
    illustrator: "Illustrator",
    canva: "Canva",
    haskell: "Haskell",
  };

  const text = techs.join(" ").toLowerCase();
  const words = text.replace(/[,;/()]/g, " ").replace(/\be\b/g, " ").split(/\s+/);
  const found = new Set<string>();

  words.forEach((word) => {
    if (techAliases[word]) {
      found.add(techAliases[word]);
    }
  });

  return Array.from(found).slice(0, 15);
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

function getMaturidadeLabel(maturidade?: string | null): string {
  if (!maturidade) {
    return "Nao informado";
  }

  const level = maturidade.split(" ")[0];
  if (maturidade.toLowerCase().includes("em desenvolvimento")) {
    return "Em Desenvolvimento";
  }

  return level;
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

export function ProjectsSection({ members }: ProjectsSectionProps) {
  const isMobile = useIsMobile();
  const projectStats = useMemo(() => {
    const projectMembers: Record<string, Member[]> = {};

    members.forEach((member) => {
      member.projetosAtuais.forEach((project) => {
        if (!projectMembers[project]) {
          projectMembers[project] = [];
        }

        projectMembers[project].push(member);
      });
    });

    return Object.entries(projectMembers)
      .map(([name, memberList]) => ({
        name: name.length > 25 ? `${name.substring(0, 25)}...` : name,
        fullName: name,
        value: memberList.length,
        members: memberList,
      }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const futureProjectsStats = useMemo(() => {
    const projectCounts: Record<string, number> = {};

    members.forEach((member) => {
      member.projetosInteresse.forEach((project) => {
        projectCounts[project] = (projectCounts[project] || 0) + 1;
      });
    });

    return Object.entries(projectCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const membersWithoutProject = useMemo(() => {
    return members.filter((member) => member.projetosAtuais.length === 0);
  }, [members]);

  const membersWithProject = useMemo(() => {
    return members.filter((member) => member.projetosAtuais.length > 0);
  }, [members]);

  const interestedInFuture = useMemo(() => {
    return members.filter((member) => member.projetosInteresse.length > 0).length;
  }, [members]);

  const membersByProjectCount = useMemo(() => {
    return members.reduce<Record<number, PrioritizedMember[]>>((acc, member) => {
      const projetosList = member.projetosAtuais;
      const count = Math.min(projetosList.length, 2);

      if (!acc[count]) {
        acc[count] = [];
      }

      acc[count].push({ ...member, projetosList });
      return acc;
    }, {});
  }, [members]);

  const sortedCounts = useMemo(() => {
    return Object.keys(membersByProjectCount)
      .map(Number)
      .sort((a, b) => a - b);
  }, [membersByProjectCount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-primary" />
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          Atuação em Projetos
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/20 p-3">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {projectStats.length}
              </p>
              <p className="text-sm text-muted-foreground">Projetos Ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-green-500/10 to-transparent backdrop-blur">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/20 p-3">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {membersWithProject.length}
              </p>
              <p className="text-sm text-muted-foreground">Em Projetos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-orange-500/10 to-transparent backdrop-blur">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-orange-500/20 p-3">
              <AlertCircle className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {membersWithoutProject.length}
              </p>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
            </div>
          </CardContent>
        </Card>
      </div>

        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Folder className="h-5 w-5 text-primary" />
            Membros por Projeto Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Membros", color: "#a855f7" },
            }}
            className="h-[340px] w-full sm:h-[400px]"
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
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  width={isMobile ? 112 : 180}
                  interval={0}
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    const text =
                      payload.value.length > (isMobile ? 24 : 50)
                        ? `${payload.value.substring(0, isMobile ? 12 : 22)}...`
                        : payload.value;

                    return (
                      <text
                        x={x - 8}
                        y={y}
                        dy={4}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize={isMobile ? 11 : 14}
                      >
                        {text}
                      </text>
                    );
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#9c2ee0",
                    border: "1px solid #2f0a4b",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number, _: string, props: any) => [
                    `${value} membros`,
                    props.payload.name,
                  ]}
                />

                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {projectStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="mt-6 space-y-4">
            {projectStats.map((project) => (
              <div
                key={project.fullName}
                className="rounded-lg border border-border/50 bg-secondary/30 p-4"
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-medium text-foreground">
                    {project.fullName}
                  </h4>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {project.value} {project.value === 1 ? "membro" : "membros"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 rounded-full bg-background/50 px-3 py-1 text-sm"
                    >
                      <span className="text-foreground">{member.nome.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2">
          <CardTitle className="flex flex-col gap-3 text-lg sm:flex-row sm:items-center sm:justify-between sm:text-xl">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Interesse em Projetos Futuros
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {interestedInFuture} membros interessados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Interessados", color: "#a855f7" },
            }}
            className="h-[320px] w-full sm:h-[280px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={futureProjectsStats}
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
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  width={isMobile ? 126 : 200}
                  interval={0}
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    const text =
                      payload.value.length > (isMobile ? 18 : 25)
                        ? `${payload.value.substring(0, isMobile ? 18 : 25)}...`
                        : payload.value;

                    return (
                      <text
                        x={x - 8}
                        y={y}
                        dy={4}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize={isMobile ? 11 : 14}
                      >
                        {text}
                      </text>
                    );
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#9c2ee0",
                    border: "1px solid #2f0a4b",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number, _: string, props: any) => [
                    `${value} interessados`,
                    props.payload.name,
                  ]}
                />

                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {futureProjectsStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <Star className="h-6 w-6 text-primary" />
            Lista de Prioridade para Novos Projetos
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
                      key={member.id}
                      className={`rounded-xl border p-4 transition-all ${colors.card}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">
                          {member.nome.trim()}
                        </span>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 text-sm ${getMaturidadeBadgeClass(member.maturidade)}`}
                        >
                          {getMaturidadeLabel(member.maturidade)}
                        </Badge>

                        {member.projetosList.map((project, projectIndex) => (
                          <Badge
                            key={`${member.id}-${projectIndex}`}
                            variant="outline"
                            className="border-border bg-secondary/50 px-2.5 py-0.5 text-sm text-foreground"
                          >
                            {project}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {extractTechTags(member.techs).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-primary/20 px-2.5 py-1 text-sm font-semibold text-primary"
                          >
                            {tech}
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
