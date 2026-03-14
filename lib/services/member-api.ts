"use client";

import axios from "axios";
import type { Member } from "@/lib/types";

const memberApiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const memberApi = {
  async list() {
    const response = await memberApiClient.get<Member[]>("/membros");
    return response.data;
  },
  async getById(id: string) {
    const response = await memberApiClient.get<Member>(
      `/membros/${encodeURIComponent(id)}`
    );
    return response.data;
  },
};
