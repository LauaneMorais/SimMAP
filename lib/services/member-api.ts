"use client";

import axios from "axios";
import type { Member, PartialMemberInput } from "@/lib/types";

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
  async getById(id: number) {
    const response = await memberApiClient.get<Member>(`/membros/${id}`);
    return response.data;
  },
  async create(payload: PartialMemberInput) {
    const response = await memberApiClient.post<Member>("/membros", payload);
    return response.data;
  },
  async update(id: number, payload: PartialMemberInput) {
    const response = await memberApiClient.put<Member>(`/membros/${id}`, payload);
    return response.data;
  },
  async remove(id: number) {
    await memberApiClient.delete(`/membros/${id}`);
  },
};
