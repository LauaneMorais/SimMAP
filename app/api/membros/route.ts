import { NextResponse } from "next/server";
import {
  listMembers,
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

export async function GET() {
  try {
    const members = await listMembers();
    return NextResponse.json(members);
  } catch (error) {
    return handleError(error);
  }
}
