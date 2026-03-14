"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { memberApi } from "@/lib/services/member-api";
import type { Member } from "@/lib/types";

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await memberApi.list();
        setMembers(data);
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

    loadMembers();
  }, []);

  return { members, loading, error };
}
