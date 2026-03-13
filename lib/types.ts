export type RawListField = string | string[] | null;

export interface RawMember {
  id: number;
  "Nome Completo": string | null;
  "Áreas de atuação": RawListField;
  "Projetos Atuais Em Andamento": RawListField;
  "Projetos Finalizados": RawListField;
  "Projetos Coordenados": RawListField;
  "Projetos com Interesse": RawListField;
  "Techs": RawListField;
  "Período": number | null;
  "Áreas de interesse": RawListField;
  "Disponibilidade": string | null;
  "Carreira": RawListField;
  "Maturidade": string | null;
  "Curso": string | null;
  "Entrada": string | null;
  "Nome Completo Original": string | null;
  "Aniversário": string | null;
  "Status": string | null;
}

export interface Member {
  id: number;
  nome: string;
  nomeOriginal: string;
  areasAtuacao: string[];
  projetosAtuais: string[];
  projetosFinalizados: string[];
  projetosCoordenados: string[];
  projetosInteresse: string[];
  techs: string[];
  periodo: number | null;
  areasInteresse: string[];
  disponibilidade: string | null;
  carreira: string[];
  maturidade: string | null;
  curso: string | null;
  entrada: string | null;
  aniversario: string | null;
  status: string | null;
}

export type MemberInput = Omit<Member, "id">;
export type PartialMemberInput = Partial<MemberInput>;
