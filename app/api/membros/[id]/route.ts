import { NextResponse } from "next/server";
import {
  getMemberBySlug,
  MemberServiceError,
} from "@/lib/services/member-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function handleError(error: unknown) {
  if (error instanceof MemberServiceError) {
    return NextResponse.json(
      {
        message: error.message,
        details: error.details ?? null,
      },
      { status: error.status }
    );
  }

  return NextResponse.json(
    { message: "Erro interno ao processar membros." },
    { status: 500 }
  );
}

function parseSlug(value: string) {
  const slug = value.trim();

  if (!slug) {
    throw new MemberServiceError("Identificador de membro invalido.", 400);
  }

  return slug;
}

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const member = await getMemberBySlug(parseSlug(id));
    return NextResponse.json(member);
  } catch (error) {
    return handleError(error);
  }
}
