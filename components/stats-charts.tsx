"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Users, Code, GraduationCap, Clock, Target } from "lucide-react";
import type { Member } from "@/lib/types";

interface StatsChartsProps {
  members: Member[];
}

const COLORS = ["#a855f7", "#c084fc", "#d8b4fe", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6"];

export function StatsCharts({ members }: StatsChartsProps) {
  const totalMembers = members.length;

  const courseData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const course = m.curso;
      counts[course] = (counts[course] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const careerData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const careers = m.carreira.split(",").map((c) => c.trim());
      careers.forEach((career) => {
        counts[career] = (counts[career] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const availabilityData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const avail = m.disponibilidade;
      counts[avail] = (counts[avail] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.replace("horas semanais", "h/sem"),
        fullName: name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const maturityData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    members.forEach((m) => {
      const matOriginal = m.maturidade.trim(); 
      
      let mat = matOriginal.toLowerCase(); 
      
      if (mat.includes("desenvolvimento")) {
        mat = "Em Desenv.";
      } else {
        mat = matOriginal.split(" ")[0]; 
      }

      counts[mat] = (counts[mat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const techData = useMemo(() => {
    const counts: Record<string, number> = {};
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
      "C#",
      "PHP",
      "Nest",
      "Express",
      "FastAPI",
      "Flutter",
    ];

    members.forEach((m) => {
      const techLower = m.tech.toLowerCase();
      techKeywords.forEach((tech) => {
        if (techLower.includes(tech.toLowerCase())) {
          counts[tech] = (counts[tech] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [members]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Estatísticas Gerais
        </h2>
        <div className="ml-2 rounded-full bg-primary/20 px-3 py-1">
          <span className="text-sm font-medium text-primary">
            {totalMembers} membros
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Tecnologias */}
        <Card className="col-span-full border-primary/20 bg-card/50 backdrop-blur lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Code className="h-5 w-5 text-primary" />
              Tecnologias Mais Usadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Membros", color: "#a855f7" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={techData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={14}
                    width={55}
                    interval={0}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {techData.map((_, index) => (
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

        {/* Cursos */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="h-5 w-5 text-primary" />
              Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Membros", color: "#a855f7" },
              }}
              className="h-[240px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {courseData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#9c2ee0",
                      border: "1px solid #2f0a4b",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} membros`,
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "13px" }}
                    formatter={(value) => (
                      <span style={{ color: "#e2e8f0" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Carreiras */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-primary" />
              Áreas de Carreira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Membros", color: "#a855f7" },
              }}
              className="h-[240px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={careerData.slice(0, 6)}
                  margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {careerData.slice(0, 6).map((_, index) => (
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

        {/* Disponibilidade */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-primary" />
              Disponibilidade Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Membros", color: "#a855f7" },
              }}
              className="h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={availabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {availabilityData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#9c2ee0",
                      border: "1px solid #2f0a4b",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number, _: string, props) => [
                      `${value} membros`,
                      props.payload.fullName || props.payload.name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "14px" }}
                    formatter={(value) => (
                      <span style={{ color: "#e2e8f0" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Maturidade */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Nível de Maturidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Membros", color: "#a855f7" },
              }}
              className="h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={maturityData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 30 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={13}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {maturityData.map((_, index) => (
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
      </div>
    </div>
  );
}
