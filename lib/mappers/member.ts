import type {
  ChartDatum,
  DashboardAnalyses,
  Member,
  Project,
  RawDashboardAnalyses,
  RawListField,
  RawMember,
  RawProject,
  RawTextField,
  SummaryMetric,
  TechnicalScoreByMaturity,
  UnmatchedNames,
} from "@/lib/types";

function trimValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringList(values: string[]) {
  return values
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeListField(value: RawListField | undefined): string[] {
  if (Array.isArray(value)) {
    return normalizeStringList(value.map((item) => `${item}`));
  }

  if (typeof value === "string") {
    return normalizeStringList(value.split(","));
  }

  return [];
}

export function normalizeTextField(value: RawTextField | undefined): string[] {
  if (Array.isArray(value)) {
    return normalizeStringList(value.map((item) => `${item}`));
  }

  const trimmed = trimValue(value);
  return trimmed ? [trimmed] : [];
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeNameKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBoolean(value: boolean | null | undefined) {
  return value === true;
}

function mapChartData(
  entries: Array<Record<string, unknown>> | undefined,
  labelKey: string,
  valueKey: string
): ChartDatum[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      const label = trimValue(entry[labelKey]);
      const value = entry[valueKey];

      if (!label || typeof value !== "number") {
        return null;
      }

      return { label, value };
    })
    .filter((entry): entry is ChartDatum => entry !== null);
}

function mapSummary(entries: RawDashboardAnalyses["resumo"]): SummaryMetric[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      const metric = trimValue(entry["Métrica"]);
      return metric ? { metric, value: entry.Valor } : null;
    })
    .filter((entry): entry is SummaryMetric => entry !== null);
}

function mapTechnicalScores(
  entries: RawDashboardAnalyses["notaTecnicaPorMaturidade"]
): TechnicalScoreByMaturity[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      const maturidade = trimValue(entry.Maturidade);

      if (!maturidade) {
        return null;
      }

      return {
        maturidade,
        respondentes: entry.Respondentes,
        notaMedia: entry["Nota Média"],
      };
    })
    .filter((entry): entry is TechnicalScoreByMaturity => entry !== null);
}

function mapUnmatchedNames(value: RawDashboardAnalyses["nomesSemMatch"]): UnmatchedNames {
  return {
    formsSemNotion: Array.isArray(value?.formsSemNotion)
      ? value.formsSemNotion.filter(Boolean)
      : [],
    notionSemForms: Array.isArray(value?.notionSemForms)
      ? value.notionSemForms.filter(Boolean)
      : [],
  };
}

export function rawAnalysesToAnalyses(rawAnalyses: RawDashboardAnalyses | undefined): DashboardAnalyses {
  return {
    summary: mapSummary(rawAnalyses?.resumo),
    byCourse: mapChartData(rawAnalyses?.porCurso, "Curso", "Quantidade"),
    byAvailability: mapChartData(
      rawAnalyses?.porDisponibilidade,
      "Disponibilidade",
      "Quantidade"
    ),
    byMaturity: mapChartData(rawAnalyses?.porMaturidade, "Maturidade", "Quantidade"),
    topCareers: mapChartData(
      rawAnalyses?.carreirasMaisCitadas,
      "Carreira",
      "Quantidade"
    ),
    topAttributes: mapChartData(
      rawAnalyses?.atributosMaisCitados,
      "Atributo",
      "Quantidade"
    ),
    topTechs: mapChartData(rawAnalyses?.techsMaisCitadas, "Tecnologia", "Quantidade"),
    interestProjects: mapChartData(
      rawAnalyses?.projetosDeInteresse,
      "Projeto",
      "Quantidade"
    ),
    technicalScoreByMaturity: mapTechnicalScores(
      rawAnalyses?.notaTecnicaPorMaturidade
    ),
    unmatchedNames: mapUnmatchedNames(rawAnalyses?.nomesSemMatch),
  };
}

export function rawMemberToMember(rawMember: RawMember): Member {
  const canonicalName = trimValue(rawMember["Nome Completo"]);
  const nomeOriginal = trimValue(rawMember["Nome Completo Original"]) ?? canonicalName ?? "Sem nome";
  const nome = nomeOriginal;
  const dataResposta = trimValue(rawMember["Data de Resposta"]);

  return {
    slug: slugify(nomeOriginal),
    nome,
    nomeOriginal,
    areasAtuacao: normalizeListField(rawMember["Áreas de atuação"]),
    projetosAtuais: normalizeListField(rawMember["Projetos Atuais Em Andamento"]),
    projetosFinalizados: normalizeListField(rawMember["Projetos Finalizados"]),
    projetosCoordenados: normalizeListField(rawMember["Projetos Coordenados"]),
    projetosInteresse: normalizeListField(rawMember["Projetos com Interesse"]),
    projetosDeclaradosForms: normalizeListField(
      rawMember["Projetos Declarados no Forms"]
    ),
    techs: normalizeListField(rawMember.Techs),
    periodo: typeof rawMember["Período"] === "number" ? rawMember["Período"] : null,
    areasInteresse: normalizeListField(rawMember["Áreas de interesse"]),
    disponibilidade: trimValue(rawMember.Disponibilidade),
    carreira: normalizeListField(rawMember.Carreira),
    maturidade: trimValue(rawMember.Maturidade),
    curso: trimValue(rawMember.Curso),
    entrada: trimValue(rawMember.Entrada),
    tempoLiga: trimValue(rawMember["Tempo de Liga"]),
    dataResposta,
    notaTecnica:
      typeof rawMember["Nota Técnica"] === "number" ? rawMember["Nota Técnica"] : null,
    atributos: normalizeListField(rawMember.Atributos),
    objetivoLawd: normalizeTextField(rawMember["Objetivo na LAWD"]),
    sugestaoRetomada: normalizeTextField(rawMember["Sugestão de Retomada"]),
    sugeriuRetomada: normalizeBoolean(rawMember["Sugeriu Retomada"]),
    propostaProjetoPessoal: trimValue(rawMember["Proposta de Projeto Pessoal"]),
    possuiProjetoPessoal: normalizeBoolean(rawMember["Possui Projeto Pessoal"]),
    aniversario: trimValue(rawMember["Aniversário"]),
    status: trimValue(rawMember.Status),
    respondeuForms: Boolean(dataResposta),
  };
}

export function rawProjectToProject(
  rawProject: RawProject,
  resolveMemberSlug: (name: string | null) => string | null
): Project {
  const canonicalName = trimValue(rawProject["Nome do Projeto"]);
  const nomeOriginal = trimValue(rawProject["Nome do Projeto Original"]) ?? canonicalName ?? "Projeto sem nome";
  const nome = nomeOriginal;
  const responsavel = trimValue(rawProject.Responsável);
  const time = normalizeListField(rawProject.Time);
  const status = trimValue(rawProject.Status);

  return {
    slug: slugify(nomeOriginal),
    nome,
    nomeOriginal,
    responsavel,
    responsavelSlug: resolveMemberSlug(responsavel),
    dataInicio: trimValue(rawProject["Data de Início"]),
    dataEncerramento: trimValue(rawProject["Data de Encerramento"]),
    status,
    prioridade: trimValue(rawProject.Prioridade),
    time,
    timeSlugs: time.map((name) => resolveMemberSlug(name)),
    teamSize: time.length,
    isActive: status?.toLowerCase() === "em andamento",
  };
}
