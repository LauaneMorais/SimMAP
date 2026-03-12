export interface Member {
  id: number;
  nome: string;
  curso: string;
  periodo: number;
  disponibilidade: string;
  tech: string;
  carreira: string;
  maturidade: string;
  projetosAtuais: string;
  projetosFuturos: string;
}

export interface MapeamentoResponse {
  mapeamento: Member[];
}
