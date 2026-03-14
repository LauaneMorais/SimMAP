export type RawListField = string | string[] | null;
export type RawTextField = string | string[] | null;

export interface RawMember {
  "Nome Completo": string | null;
  "Áreas de atuação": RawListField;
  "Projetos Atuais Em Andamento": RawListField;
  "Projetos Finalizados": RawListField;
  "Projetos Coordenados": RawListField;
  "Projetos com Interesse": RawListField;
  "Projetos Declarados no Forms": RawListField;
  Techs: RawListField;
  "Período": number | null;
  "Áreas de interesse": RawListField;
  Disponibilidade: string | null;
  Carreira: RawListField;
  Maturidade: string | null;
  Curso: string | null;
  Entrada: string | null;
  "Tempo de Liga": string | null;
  "Data de Resposta": string | null;
  "Nota Técnica": number | null;
  Atributos: RawListField;
  "Objetivo na LAWD": RawTextField;
  "Sugestão de Retomada": RawTextField;
  "Sugeriu Retomada": boolean | null;
  "Proposta de Projeto Pessoal": string | null;
  "Possui Projeto Pessoal": boolean | null;
  "Nome Completo Original": string | null;
  "Aniversário": string | null;
  Status: string | null;
}

export interface RawProject {
  "Nome do Projeto": string | null;
  "Nome do Projeto Original": string | null;
  Responsável: string | null;
  "Data de Início": string | null;
  "Data de Encerramento": string | null;
  Status: string | null;
  Prioridade: string | null;
  Time: RawListField;
}

export interface RawDashboardAnalyses {
  resumo?: Array<{
    "Métrica": string;
    Valor: number;
  }>;
  porCurso?: Array<{
    Curso: string;
    Quantidade: number;
  }>;
  porDisponibilidade?: Array<{
    Disponibilidade: string;
    Quantidade: number;
  }>;
  porMaturidade?: Array<{
    Maturidade: string;
    Quantidade: number;
  }>;
  carreirasMaisCitadas?: Array<{
    Carreira: string;
    Quantidade: number;
  }>;
  atributosMaisCitados?: Array<{
    Atributo: string;
    Quantidade: number;
  }>;
  techsMaisCitadas?: Array<{
    Tecnologia: string;
    Quantidade: number;
  }>;
  projetosDeInteresse?: Array<{
    Projeto: string;
    Quantidade: number;
  }>;
  notaTecnicaPorMaturidade?: Array<{
    Maturidade: string;
    Respondentes: number;
    "Nota Média": number;
  }>;
  nomesSemMatch?: {
    formsSemNotion?: string[];
    notionSemForms?: string[];
  };
}

export interface SummaryMetric {
  metric: string;
  value: number;
}

export interface ChartDatum {
  label: string;
  value: number;
}

export interface TechnicalScoreByMaturity {
  maturidade: string;
  respondentes: number;
  notaMedia: number;
}

export interface UnmatchedNames {
  formsSemNotion: string[];
  notionSemForms: string[];
}

export interface DashboardAnalyses {
  summary: SummaryMetric[];
  byCourse: ChartDatum[];
  byAvailability: ChartDatum[];
  byMaturity: ChartDatum[];
  topCareers: ChartDatum[];
  topAttributes: ChartDatum[];
  topTechs: ChartDatum[];
  interestProjects: ChartDatum[];
  technicalScoreByMaturity: TechnicalScoreByMaturity[];
  unmatchedNames: UnmatchedNames;
}

export interface Member {
  slug: string;
  nome: string;
  nomeOriginal: string;
  areasAtuacao: string[];
  projetosAtuais: string[];
  projetosFinalizados: string[];
  projetosCoordenados: string[];
  projetosInteresse: string[];
  projetosDeclaradosForms: string[];
  techs: string[];
  periodo: number | null;
  areasInteresse: string[];
  disponibilidade: string | null;
  carreira: string[];
  maturidade: string | null;
  curso: string | null;
  entrada: string | null;
  tempoLiga: string | null;
  dataResposta: string | null;
  notaTecnica: number | null;
  atributos: string[];
  objetivoLawd: string[];
  sugestaoRetomada: string[];
  sugeriuRetomada: boolean;
  propostaProjetoPessoal: string | null;
  possuiProjetoPessoal: boolean;
  aniversario: string | null;
  status: string | null;
  respondeuForms: boolean;
}

export interface Project {
  slug: string;
  nome: string;
  nomeOriginal: string;
  responsavel: string | null;
  responsavelSlug: string | null;
  dataInicio: string | null;
  dataEncerramento: string | null;
  status: string | null;
  prioridade: string | null;
  time: string[];
  timeSlugs: Array<string | null>;
  teamSize: number;
  isActive: boolean;
}

export interface DashboardData {
  members: Member[];
  projects: Project[];
  analyses: DashboardAnalyses;
}
