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
import type { Member } from "@/lib/types";

interface ProjectsSectionProps {
  members: Member[];
}

const COLORS = ["#a855f7", "#c084fc", "#d8b4fe", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"];

function extractTechTags(tech: string): string[] {
  const techKeywords = [
    "React",
    "Next",
    "TypeScript",
    "JavaScript",
    "Python",
    "Java",
    "Node",
    "Tailwind",
    "PostgreSQL",
    "Docker",
    "Git",
    "Figma",
    "Vue",
    "Angular",
    "Nest",
    "Express",
    "FastAPI",
    "Flutter",
    "C#",
    "PHP",
  ];

  const techLower = tech.toLowerCase();
  return techKeywords.filter((t) => techLower.includes(t.toLowerCase())).slice(0, 4);
}

function getMaturidadeBadgeClass(maturidade: string): string {
  const level = maturidade.split(" ")[0].toLowerCase();
  switch (level) {
    case "mentor":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "autônomo":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "em":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "iniciante":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default:
      return "bg-primary/20 text-primary border-primary/30";
  }
}

function getMaturidadeLabel(maturidade: string): string {
  const level = maturidade.split(" ")[0];
  if (maturidade.toLowerCase().includes("em desenvolvimento")) {
    return "Em Desenvolvimento";
  }
  return level;
}

export function ProjectsSection({ members }: ProjectsSectionProps) {
  const projectStats = useMemo(() => {
    const projectMembers: Record<string, Member[]> = {};

    members.forEach((member) => {
      const projects = member.projetosAtuais
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p && !p.toLowerCase().includes("nenhum"));

      projects.forEach((project) => {
        if (!projectMembers[project]) {
          projectMembers[project] = [];
        }
        projectMembers[project].push(member);
      });
    });

    return Object.entries(projectMembers)
      .map(([name, memberList]) => ({
        name: name.length > 25 ? name.substring(0, 25) + "..." : name,
        fullName: name,
        value: memberList.length,
        members: memberList,
      }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const futureProjectsStats = useMemo(() => {
    const projectCounts: Record<string, number> = {};

    members.forEach((member) => {
      const projects = member.projetosFuturos
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);

      projects.forEach((project) => {
        projectCounts[project] = (projectCounts[project] || 0) + 1;
      });
    });

    return Object.entries(projectCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const membersWithoutProject = useMemo(() => {
    return members.filter((m) =>
      m.projetosAtuais.toLowerCase().includes("nenhum")
    );
  }, [members]);

  const membersWithProject = useMemo(() => {
    return members.filter(
      (m) => !m.projetosAtuais.toLowerCase().includes("nenhum")
    );
  }, [members]);

  const interestedInFuture = useMemo(() => {
    return members.filter((m) => m.projetosFuturos.trim().length > 0).length;
  }, [members]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Atuação em Projetos
        </h2>
      </div>

      {/* Stats Cards */}
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

      {/* Project Distribution Chart */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Folder className="h-4 w-4 text-primary" />
            Membros por Projeto Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Membros", color: "#a855f7" },
            }}
            className="h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1b4b",
                    border: "1px solid #4c1d95",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number, _: string, props) => [
                    `${value} membros`,
                    props.payload.fullName,
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

          {/* Project Members Detail */}
          <div className="mt-6 space-y-4">
            {projectStats.map((project) => (
              <div
                key={project.fullName}
                className="rounded-lg border border-border/50 bg-secondary/30 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
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

      {/* Future Projects Interest */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
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
            className="h-[280px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={futureProjectsStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 180, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  width={170}
                  tickFormatter={(value) =>
                    value.length > 35 ? value.substring(0, 35) + "..." : value
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1b4b",
                    border: "1px solid #4c1d95",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`${value} interessados`]}
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

      {/* Priority List for Future Projects */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-primary" />
            Lista de Prioridade para Novos Projetos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Priority 1 - Members without projects */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                Prioridade 1
              </Badge>
              <span className="text-sm text-muted-foreground">
                Membros sem projeto atual ({membersWithoutProject.length})
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {membersWithoutProject.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 transition-all hover:border-red-500/40 hover:bg-red-500/10"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {member.nome.trim()}
                    </span>
                  </div>
                  <div className="mb-2">
                    <Badge
                      variant="outline"
                      className={getMaturidadeBadgeClass(member.maturidade)}
                    >
                      {getMaturidadeLabel(member.maturidade)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {extractTechTags(member.tech).map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority 2 - Members already in projects */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                Prioridade 2
              </Badge>
              <span className="text-sm text-muted-foreground">
                Membros já em projetos ({membersWithProject.length})
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {membersWithProject.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 transition-all hover:border-yellow-500/40 hover:bg-yellow-500/10"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {member.nome.trim()}
                    </span>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    <Badge
                      variant="outline"
                      className={getMaturidadeBadgeClass(member.maturidade)}
                    >
                      {getMaturidadeLabel(member.maturidade)}
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border">
                      {member.projetosAtuais.split(",")[0].trim()}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {extractTechTags(member.tech).map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
