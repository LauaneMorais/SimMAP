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
  if (!tech) return [];

  const techAliases: Record<string, string> = {
    "js": "JavaScript", "javascript": "JavaScript",
    "ts": "TypeScript", "typescript": "TypeScript",
    "html": "HTML", "css": "CSS", "sass": "Sass", "vanilla": "Vanilla",
    "react": "React", "next": "Next.js", "nextjs": "Next.js", "next.js": "Next.js",
    "vue": "Vue", "vue.js": "Vue", "angular": "Angular", "angular.js": "Angular",
    "tailwind": "Tailwind", "tailwindcss": "Tailwind",
    "node": "Node.js", "nodejs": "Node.js", "node.js": "Node.js",
    "python": "Python", "java": "Java", "c": "C", "c++": "C++", "c#": "C#",
    "php": "PHP", "golang": "Golang", "rust": "Rust", "kotlin": "Kotlin",
    "nest": "Nest", "nestjs": "Nest", "express": "Express", "fastapi": "FastAPI",
    "spring": "Spring", "springboot": "Spring", "django": "Django",
    "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "sql": "SQL",
    "prisma": "Prisma", "supabase": "Supabase",
    "docker": "Docker", "aws": "AWS", 
    "git": "Git", "github": "GitHub", "gitlab": "GitLab",
    "flutter": "Flutter", 
    "figma": "Figma", "photoshop": "Photoshop", "illustrator": "Illustrator", "canva": "Canva",
    "haskell": "Haskell",
  };

  const text = tech.toLowerCase();
  const words = text.replace(/[,;/()]/g, ' ').replace(/\be\b/g, ' ').split(/\s+/);
  const found = new Set<string>();

  words.forEach(word => {
    if (techAliases[word]) {
      found.add(techAliases[word]);
    }
  });

  return Array.from(found).slice(0, 15);
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

function getPriorityColors(index: number) {
  const colors = [
    { badge: "bg-red-500/20 text-red-400 border-red-500/30", card: "border-red-500/30 bg-red-500/5 hover:border-red-500/50 hover:bg-red-500/10" },
    { badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", card: "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10" },
    { badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", card: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 hover:bg-blue-500/10" },
  ];
  return colors[Math.min(index, colors.length - 1)];
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

  // --- NOVA LÓGICA DE PRIORIDADES: 0, 1 e 2+ ---
  const membersByProjectCount = useMemo(() => {
    return members.reduce((acc, member) => {
      const projetosRaw = member.projetosAtuais || "";
      const projetosList = projetosRaw
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0 && p.toLowerCase() !== "nenhum");

      // A grande sacada: se tiver 0 vai pro grupo 0, se tiver 1 vai pro grupo 1, 
      // se tiver 2, 3, 4, etc. todos caem no grupo 2!
      const count = Math.min(projetosList.length, 2); 

      if (!acc[count]) acc[count] = [];
      acc[count].push({ ...member, projetosList }); 
      return acc;
    }, {} as Record<number, any[]>);
  }, [members]);

  // Garante a ordem correta na hora de renderizar na tela
  const sortedCounts = useMemo(() => {
    return Object.keys(membersByProjectCount)
      .map(Number)
      .sort((a, b) => a - b);
  }, [membersByProjectCount]);

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
          <CardTitle className="flex items-center gap-2 text-xl">
            <Folder className="h-5 w-5 text-primary" />
            Membros por Projeto Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Membros", color: "#a855f7" },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                  data={projectStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }} 
                >
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    width={180} 
                    interval={0} 
                    tick={(props: any) => {
                      const { x, y, payload } = props;
                      
                      const text = payload.value.length > 50 
                        ? `${payload.value.substring(0, 22)}...` 
                        : payload.value;

                      return (
                        <text 
                          x={x - 8} 
                          y={y} 
                          dy={4} 
                          textAnchor="end" 
                          fill="#94a3b8" 
                          fontSize={14}
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
          <CardTitle className="flex items-center justify-between text-xl">
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
            className="h-[280px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={futureProjectsStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  width={200}
                  interval={0}
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    
                    const text = payload.value.length > 25 
                      ? `${payload.value.substring(0, 25)}...` 
                      : payload.value;

                    return (
                      <text 
                        x={x - 8} 
                        y={y} 
                        dy={4} 
                        textAnchor="end" 
                        fill="#94a3b8" 
                        fontSize={14}
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

      {/* Priority List for Future Projects */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Star className="h-6 w-6 text-primary" />
            Lista de Prioridade para Novos Projetos
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {sortedCounts.map((projectCount, index) => {
            const priorityLevel = index + 1; // 1, 2, 3...
            const groupMembers = membersByProjectCount[projectCount];
            const colors = getPriorityColors(index);

            let groupLabelText = "";
            if (projectCount === 0) groupLabelText = `Sem projetos atuais (${groupMembers.length})`;
            else if (projectCount === 1) groupLabelText = `Atuando em 1 projeto (${groupMembers.length})`;
            else groupLabelText = `Atuando em 2 ou mais projetos (${groupMembers.length})`;

            return (
              <div key={`priority-${priorityLevel}`}>
                {/* Priority Header */}
                <div className="mb-4 flex items-center gap-3">
                  <Badge className={`px-3 py-1 text-sm font-bold border ${colors.badge}`}>
                    Prioridade {priorityLevel}
                  </Badge>
                  <span className="text-base font-medium text-muted-foreground">
                    {groupLabelText}
                  </span>
                </div>

                {/* Members Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`rounded-xl border p-4 transition-all ${colors.card}`}
                    >
                      {/* Nome do Membro */}
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">
                          {member.nome.trim()}
                        </span>
                      </div>

                      {/* Maturity Tags and all Projects */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={`text-sm px-2.5 py-0.5 ${getMaturidadeBadgeClass(member.maturidade)}`}
                        >
                          {getMaturidadeLabel(member.maturidade)}
                        </Badge>
                        
                        {}
                        {member.projetosList.map((proj: string, pIdx: number) => (
                          <Badge 
                            key={pIdx} 
                            variant="outline" 
                            className="bg-secondary/50 text-sm px-2.5 py-0.5 text-foreground border-border"
                          >
                            {proj}
                          </Badge>
                        ))}
                      </div>

                      {/* Technology Tags */}
                      <div className="flex flex-wrap gap-2">
                        {extractTechTags(member.tech).map((tech) => (
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