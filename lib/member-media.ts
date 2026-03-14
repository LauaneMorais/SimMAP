import type { Member } from "@/lib/types";

const PHOTO_ENTRIES = [
  { label: "Alipio Fernando", src: "/members/alipio-fernando.jpeg" },
  { label: "Álvaro Luís", src: "/members/alvaro-luis.jpeg" },
  { label: "André Felipe", src: "/members/andre-felipe.jpg" },
  { label: "Breno Gustavo", src: "/members/breno-gustavo.jpg" },
  { label: "Bruno Saint Clair", src: "/members/bruno-saint-clair.jpg" },
  { label: "Daniel Trindade", src: "/members/daniel-trindade.jpg" },
  { label: "Davi Bittencourt", src: "/members/davi-bittencourt.jpeg" },
  { label: "Dimitri Martins", src: "/members/dimitri-martins.jpg" },
  { label: "Enzo Emanuel", src: "/members/enzo-emanuel.jpg" },
  { label: "Erick Juan", src: "/members/erick-juan.jpg" },
  { label: "Gabriel Almeida", src: "/members/gabriel-almeida.jpeg" },
  { label: "Gabriel Argôlo", src: "/members/gabriel-argolo.jpg" },
  { label: "Giulian Bastos", src: "/members/giulian-bastos.jpeg" },
  { label: "Guilherme Linard", src: "/members/guilherme-linard.jpeg" },
  { label: "Guilherme Viana", src: "/members/guilherme-viana.jpeg" },
  { label: "Gustavo Aragão", src: "/members/gustavo-aragao.jpg" },
  { label: "Gyovani Santos", src: "/members/gyovani-santos.jpeg" },
  { label: "Irlan Alves", src: "/members/irlan-alves.webp" },
  { label: "Irwing Felipe", src: "/members/irwing-felipe.jpg" },
  { label: "Isadora Oliveira", src: "/members/isadora-oliveira.jpg" },
  { label: "Jessica Viana", src: "/members/jessica-viana.png" },
  { label: "João Felipe Quentino", src: "/members/joao-felipe-quentino.jpg" },
  { label: "Lauane Morais", src: "/members/lauane-morais.jpg" },
  { label: "Levi Ribeiro", src: "/members/levi-ribeiro.jpeg" },
  { label: "Luan Meireles", src: "/members/luan-meireles.jpg" },
  { label: "Maria Luiza", src: "/members/maria-luiza.png" },
  { label: "Paulo Marques", src: "/members/paulo-marques.jpeg" },
  { label: "Pedro Corrêa", src: "/members/pedro-correa.png" },
  { label: "Pedro Souza", src: "/members/pedro-souza.webp" },
  { label: "Thayla Figueiredo", src: "/members/thayla-figueiredo.jpeg" },
  { label: "Vinícius Morais", src: "/members/vinicius-morais.jpg" },
  { label: "Wanessa Santos", src: "/members/wanessa-santos.webp" },
  { label: "Wesley Góis", src: "/members/wesley-gois.jpg" },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value).split(" ").filter(Boolean);
}

export function getMemberPhoto(member: Pick<Member, "nome" | "nomeOriginal">) {
  const memberTokens = new Set(tokenize(member.nomeOriginal || member.nome));

  let selected: string | null = null;
  let bestScore = 0;

  for (const entry of PHOTO_ENTRIES) {
    const entryTokens = tokenize(entry.label);
    const score = entryTokens.filter((token) => memberTokens.has(token)).length;

    if (score === entryTokens.length && score > bestScore) {
      selected = entry.src;
      bestScore = score;
    }
  }

  return selected ?? "/placeholder-user.jpg";
}
