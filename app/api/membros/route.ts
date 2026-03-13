import { NextResponse } from "next/server";
import { normalizeMemberPayload } from "@/lib/mappers/member";
import {
  createMember,
  listMembers,
  MemberServiceError,
} from "@/lib/services/member-service";

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

export async function POST(request: Request) {
  try {
    const payload = normalizeMemberPayload(await request.json());
    const createdMember = await createMember(payload);
    return NextResponse.json(createdMember, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
