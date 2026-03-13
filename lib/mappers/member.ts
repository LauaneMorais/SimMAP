import type { Member, MemberInput, PartialMemberInput, RawListField, RawMember } from "@/lib/types";

function trimValue(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeListField(value: RawListField | undefined): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => `${item}`.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function rawMemberToMember(rawMember: RawMember): Member {
  const nome = trimValue(rawMember["Nome Completo"]) ?? "Sem nome";

  return {
    id: rawMember.id,
    nome,
    nomeOriginal: trimValue(rawMember["Nome Completo Original"]) ?? nome,
    areasAtuacao: normalizeListField(rawMember["Áreas de atuação"]),
    projetosAtuais: normalizeListField(rawMember["Projetos Atuais Em Andamento"]),
    projetosFinalizados: normalizeListField(rawMember["Projetos Finalizados"]),
    projetosCoordenados: normalizeListField(rawMember["Projetos Coordenados"]),
    projetosInteresse: normalizeListField(rawMember["Projetos com Interesse"]),
    techs: normalizeListField(rawMember["Techs"]),
    periodo: typeof rawMember["Período"] === "number" ? rawMember["Período"] : null,
    areasInteresse: normalizeListField(rawMember["Áreas de interesse"]),
    disponibilidade: trimValue(rawMember["Disponibilidade"]) ?? null,
    carreira: normalizeListField(rawMember["Carreira"]),
    maturidade: trimValue(rawMember["Maturidade"]) ?? null,
    curso: trimValue(rawMember["Curso"]) ?? null,
    entrada: trimValue(rawMember["Entrada"]) ?? null,
    aniversario: trimValue(rawMember["Aniversário"]) ?? null,
    status: trimValue(rawMember["Status"]) ?? null,
  };
}

export function memberInputToRawMember(
  member: MemberInput,
  id?: number
): Omit<RawMember, "id"> | RawMember {
  const rawMember = {
    "Nome Completo": member.nome,
    "Áreas de atuação": member.areasAtuacao,
    "Projetos Atuais Em Andamento": member.projetosAtuais,
    "Projetos Finalizados": member.projetosFinalizados,
    "Projetos Coordenados": member.projetosCoordenados,
    "Projetos com Interesse": member.projetosInteresse,
    "Techs": member.techs,
    "Período": member.periodo,
    "Áreas de interesse": member.areasInteresse,
    "Disponibilidade": member.disponibilidade,
    "Carreira": member.carreira,
    "Maturidade": member.maturidade,
    "Curso": member.curso,
    "Entrada": member.entrada,
    "Nome Completo Original": member.nomeOriginal,
    "Aniversário": member.aniversario,
    "Status": member.status,
  };

  return typeof id === "number" ? { id, ...rawMember } : rawMember;
}

function assignIfDefined<T extends keyof PartialMemberInput>(
  target: PartialMemberInput,
  key: T,
  value: PartialMemberInput[T] | undefined
) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function parseNumber(value: unknown): number | null | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function parseNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return trimValue(value);
}

function parseList(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => `${item}`.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
}

export function normalizeMemberPayload(payload: unknown): PartialMemberInput {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const data = payload as Record<string, unknown>;
  const normalized: PartialMemberInput = {};

  assignIfDefined(normalized, "nome", parseNullableString(data.nome) ?? undefined);
  assignIfDefined(
    normalized,
    "nomeOriginal",
    parseNullableString(data.nomeOriginal) ?? undefined
  );
  assignIfDefined(normalized, "areasAtuacao", parseList(data.areasAtuacao));
  assignIfDefined(normalized, "projetosAtuais", parseList(data.projetosAtuais));
  assignIfDefined(
    normalized,
    "projetosFinalizados",
    parseList(data.projetosFinalizados)
  );
  assignIfDefined(
    normalized,
    "projetosCoordenados",
    parseList(data.projetosCoordenados)
  );
  assignIfDefined(
    normalized,
    "projetosInteresse",
    parseList(data.projetosInteresse)
  );
  assignIfDefined(normalized, "techs", parseList(data.techs));
  assignIfDefined(normalized, "periodo", parseNumber(data.periodo));
  assignIfDefined(normalized, "areasInteresse", parseList(data.areasInteresse));
  assignIfDefined(
    normalized,
    "disponibilidade",
    parseNullableString(data.disponibilidade)
  );
  assignIfDefined(normalized, "carreira", parseList(data.carreira));
  assignIfDefined(normalized, "maturidade", parseNullableString(data.maturidade));
  assignIfDefined(normalized, "curso", parseNullableString(data.curso));
  assignIfDefined(normalized, "entrada", parseNullableString(data.entrada));
  assignIfDefined(normalized, "aniversario", parseNullableString(data.aniversario));
  assignIfDefined(normalized, "status", parseNullableString(data.status));

  return normalized;
}

export function buildMemberInput(payload: PartialMemberInput): MemberInput {
  const nome = payload.nome?.trim();

  if (!nome) {
    throw new Error("O campo 'nome' e obrigatorio.");
  }

  return {
    nome,
    nomeOriginal: payload.nomeOriginal?.trim() || nome,
    areasAtuacao: payload.areasAtuacao ?? [],
    projetosAtuais: payload.projetosAtuais ?? [],
    projetosFinalizados: payload.projetosFinalizados ?? [],
    projetosCoordenados: payload.projetosCoordenados ?? [],
    projetosInteresse: payload.projetosInteresse ?? [],
    techs: payload.techs ?? [],
    periodo: payload.periodo ?? null,
    areasInteresse: payload.areasInteresse ?? [],
    disponibilidade: payload.disponibilidade ?? null,
    carreira: payload.carreira ?? [],
    maturidade: payload.maturidade ?? null,
    curso: payload.curso ?? null,
    entrada: payload.entrada ?? null,
    aniversario: payload.aniversario ?? null,
    status: payload.status ?? null,
  };
}

export function memberToInput(member: Member): MemberInput {
  return {
    nome: member.nome,
    nomeOriginal: member.nomeOriginal,
    areasAtuacao: member.areasAtuacao,
    projetosAtuais: member.projetosAtuais,
    projetosFinalizados: member.projetosFinalizados,
    projetosCoordenados: member.projetosCoordenados,
    projetosInteresse: member.projetosInteresse,
    techs: member.techs,
    periodo: member.periodo,
    areasInteresse: member.areasInteresse,
    disponibilidade: member.disponibilidade,
    carreira: member.carreira,
    maturidade: member.maturidade,
    curso: member.curso,
    entrada: member.entrada,
    aniversario: member.aniversario,
    status: member.status,
  };
}
