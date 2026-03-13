import axios from "axios";

export const jsonServerClient = axios.create({
  baseURL: process.env.JSON_SERVER_URL ?? "http://127.0.0.1:3001",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});
