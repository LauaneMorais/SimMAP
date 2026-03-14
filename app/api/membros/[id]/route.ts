import { NextResponse } from "next/server";
import { normalizeMemberPayload } from "@/lib/mappers/member";
import {
  deleteMember,
  getMemberById,
  MemberServiceError,
  updateMember,
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

function parseId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new MemberServiceError("ID de membro invalido.", 400);
  }

  return id;
}

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const member = await getMemberById(parseId(id));
    return NextResponse.json(member);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = normalizeMemberPayload(await request.json());
    const member = await updateMember(parseId(id), payload);
    return NextResponse.json(member);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = normalizeMemberPayload(await request.json());
    const member = await updateMember(parseId(id), payload);
    return NextResponse.json(member);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await deleteMember(parseId(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
