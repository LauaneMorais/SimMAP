import { AxiosError } from "axios";
import {
  buildMemberInput,
  memberInputToRawMember,
  memberToInput,
  rawMemberToMember,
} from "@/lib/mappers/member";
import { jsonServerClient } from "@/lib/services/json-server-client";
import type { Member, PartialMemberInput, RawMember } from "@/lib/types";

export class MemberServiceError extends Error {
  constructor(
    message: string,
    public status = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "MemberServiceError";
  }
}

function toServiceError(error: unknown): MemberServiceError {
  if (error instanceof MemberServiceError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 500;
    const details = error.response?.data;

    if (status === 404) {
      return new MemberServiceError("Membro nao encontrado.", 404, details);
    }

    if (status >= 400 && status < 500) {
      return new MemberServiceError("Falha ao acessar o JSON Server.", status, details);
    }

    return new MemberServiceError(
      "Nao foi possivel comunicar com o JSON Server.",
      status,
      details
    );
  }

  if (error instanceof Error) {
    return new MemberServiceError(error.message);
  }

  return new MemberServiceError("Erro inesperado ao processar membros.");
}

export async function listMembers(): Promise<Member[]> {
  try {
    const response = await jsonServerClient.get<RawMember[]>("/membros");
    return response.data.map(rawMemberToMember);
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function getMemberById(id: number): Promise<Member> {
  try {
    const response = await jsonServerClient.get<RawMember>(`/membros/${id}`);
    return rawMemberToMember(response.data);
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function createMember(
  payload: PartialMemberInput
): Promise<Member> {
  try {
    const memberInput = buildMemberInput(payload);
    const response = await jsonServerClient.post<RawMember>(
      "/membros",
      memberInputToRawMember(memberInput)
    );

    return rawMemberToMember(response.data);
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function updateMember(
  id: number,
  payload: PartialMemberInput
): Promise<Member> {
  try {
    const currentMember = await getMemberById(id);
    const mergedInput = buildMemberInput({
      ...memberToInput(currentMember),
      ...payload,
    });

    const response = await jsonServerClient.put<RawMember>(
      `/membros/${id}`,
      memberInputToRawMember(mergedInput, id)
    );

    return rawMemberToMember(response.data);
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function deleteMember(id: number): Promise<void> {
  try {
    await jsonServerClient.delete(`/membros/${id}`);
  } catch (error) {
    throw toServiceError(error);
  }
}
