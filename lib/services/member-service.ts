import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildMemberInput,
  memberInputToRawMember,
  memberToInput,
  rawMemberToMember,
} from "@/lib/mappers/member";
import type { Member, PartialMemberInput, RawMember } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "db", "db.json");

interface MembersDatabase {
  membros: RawMember[];
  [key: string]: unknown;
}

let writeQueue: Promise<void> = Promise.resolve();

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

async function readDatabase(): Promise<MembersDatabase> {
  const fileContent = await readFile(DB_PATH, "utf-8");
  const parsed = JSON.parse(fileContent) as Partial<MembersDatabase>;

  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.membros)) {
    throw new MemberServiceError("Formato invalido em db/db.json.");
  }

  return {
    ...parsed,
    membros: parsed.membros as RawMember[],
  };
}

async function writeDatabase(database: MembersDatabase): Promise<void> {
  const tempPath = `${DB_PATH}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(database, null, 2)}\n`, "utf-8");
  await rename(tempPath, DB_PATH);
}

function withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

function getNextMemberId(members: RawMember[]): number {
  return members.reduce((maxId, member) => Math.max(maxId, member.id), 0) + 1;
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
    if (error.message === "O campo 'nome' e obrigatorio.") {
      return new MemberServiceError(error.message, 400);
    }

    return new MemberServiceError(error.message);
  }

  return new MemberServiceError("Erro inesperado ao processar membros.");
}

export async function listMembers(): Promise<Member[]> {
  try {
    const database = await readDatabase();
    return database.membros.map(rawMemberToMember);
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function getMemberById(id: number): Promise<Member> {
  try {
    const database = await readDatabase();
    const member = database.membros.find((item) => item.id === id);

    if (!member) {
      throw new MemberServiceError("Membro nao encontrado.", 404);
    }

    return rawMemberToMember(member);
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function createMember(
  payload: PartialMemberInput
): Promise<Member> {
  try {
    return await withWriteLock(async () => {
      const database = await readDatabase();
      const memberInput = buildMemberInput(payload);
      const createdMember: RawMember = {
        id: getNextMemberId(database.membros),
        ...(memberInputToRawMember(memberInput) as Omit<RawMember, "id">),
      };

      database.membros.push(createdMember);
      await writeDatabase(database);

      return rawMemberToMember(createdMember);
    });
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function updateMember(
  id: number,
  payload: PartialMemberInput
): Promise<Member> {
  try {
    return await withWriteLock(async () => {
      const database = await readDatabase();
      const currentIndex = database.membros.findIndex((item) => item.id === id);

      if (currentIndex === -1) {
        throw new MemberServiceError("Membro nao encontrado.", 404);
      }

      const currentMember = rawMemberToMember(database.membros[currentIndex]);
      const mergedInput = buildMemberInput({
        ...memberToInput(currentMember),
        ...payload,
      });
      const updatedMember = memberInputToRawMember(mergedInput, id) as RawMember;

      database.membros[currentIndex] = updatedMember;
      await writeDatabase(database);

      return rawMemberToMember(updatedMember);
    });
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function deleteMember(id: number): Promise<void> {
  try {
    await withWriteLock(async () => {
      const database = await readDatabase();
      const nextMembers = database.membros.filter((member) => member.id !== id);

      if (nextMembers.length === database.membros.length) {
        throw new MemberServiceError("Membro nao encontrado.", 404);
      }

      database.membros = nextMembers;
      await writeDatabase(database);
    });
  } catch (error) {
    throw toServiceError(error);
  }
}
