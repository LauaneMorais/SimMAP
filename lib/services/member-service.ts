import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeNameKey,
  rawAnalysesToAnalyses,
  rawMemberToMember,
  rawProjectToProject,
} from "@/lib/mappers/member";
import type {
  DashboardData,
  RawDashboardAnalyses,
  RawMember,
  RawProject,
} from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "db", "db.json");

interface DatabaseFile {
  membros: RawMember[];
  projetos: RawProject[];
  analises?: RawDashboardAnalyses;
}

export class MemberServiceError extends Error {
  constructor(
    message: string,
    public status = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "MemberServiceError";
  }
}

function isErrorWithCode(error: unknown): error is Error & { code: string } {
  return (
    error instanceof Error &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

async function readDatabase(): Promise<DatabaseFile> {
  const fileContent = await readFile(DB_PATH, "utf-8");
  const parsed = JSON.parse(fileContent) as Partial<DatabaseFile>;

  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.membros)) {
    throw new MemberServiceError("Formato invalido em db/db.json.");
  }

  return {
    membros: parsed.membros as RawMember[],
    projetos: Array.isArray(parsed.projetos) ? (parsed.projetos as RawProject[]) : [],
    analises: parsed.analises as RawDashboardAnalyses | undefined,
  };
}

function toServiceError(error: unknown): MemberServiceError {
  if (error instanceof MemberServiceError) {
    return error;
  }

  if (error instanceof SyntaxError) {
    return new MemberServiceError("O arquivo db/db.json contem JSON invalido.");
  }

  if (isErrorWithCode(error)) {
    if (error.code === "ENOENT") {
      return new MemberServiceError("O arquivo db/db.json nao foi encontrado.");
    }

    return new MemberServiceError(
      "Nao foi possivel acessar o arquivo db/db.json.",
      500,
      { code: error.code }
    );
  }

  if (error instanceof Error) {
    return new MemberServiceError(error.message);
  }

  return new MemberServiceError("Erro inesperado ao processar membros.");
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const database = await readDatabase();
    const members = database.membros.map(rawMemberToMember);
    const membersByNameKey = new Map(
      members.map((member) => [normalizeNameKey(member.nomeOriginal), member.slug])
    );

    const resolveMemberSlug = (name: string | null) => {
      if (!name) {
        return null;
      }

      return membersByNameKey.get(normalizeNameKey(name)) ?? null;
    };

    return {
      members,
      projects: database.projetos.map((project) =>
        rawProjectToProject(project, resolveMemberSlug)
      ),
      analyses: rawAnalysesToAnalyses(database.analises),
    };
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function getMemberBySlug(slug: string) {
  const { members } = await getDashboardData();
  const member = members.find((item) => item.slug === slug);

  if (!member) {
    throw new MemberServiceError("Membro nao encontrado.", 404);
  }

  return member;
}
