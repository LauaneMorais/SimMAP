"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { memberApi } from "@/lib/services/member-api";
import type { Member } from "@/lib/types";

export function useMember(memberId: number | null) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(Boolean(memberId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) {
      setMember(null);
      setLoading(false);
      setError("Membro inválido.");
      return;
    }

    const safeMemberId = memberId;

    async function loadMember() {
      try {
        const data = await memberApi.getById(safeMemberId);
        setMember(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const apiMessage =
            typeof err.response?.data?.message === "string"
              ? err.response.data.message
              : null;

          setError(apiMessage ?? err.message);
          return;
        }

        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    setError(null);
    loadMember();
  }, [memberId]);

  return { member, loading, error };
}
