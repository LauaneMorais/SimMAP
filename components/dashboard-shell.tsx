"use client";

import { useState } from "react";
import { MemberSelector } from "@/components/member-selector";
import { ProjectsSection } from "@/components/projects-section";
import { StatsCharts } from "@/components/stats-charts";
import type { DashboardData, Member } from "@/lib/types";

interface DashboardShellProps {
  data: DashboardData;
}

export function DashboardShell({ data }: DashboardShellProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  return (
    <>
      <MemberSelector
        members={data.members}
        selectedMember={selectedMember}
        onSelect={setSelectedMember}
      />
      <StatsCharts members={data.members} analyses={data.analyses} />
      <ProjectsSection
        members={data.members}
        projects={data.projects}
        analyses={data.analyses}
      />
    </>
  );
}
