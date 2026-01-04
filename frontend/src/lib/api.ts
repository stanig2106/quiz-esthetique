import type { Attempt, Question, Stats } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erreur réseau");
  }
  return response.json() as Promise<T>;
};

export const getSettings = () => request<{ appName: string }>("/settings");

export const updateSettings = (appName: string) =>
  request<{ appName: string }>("/settings", {
    method: "PUT",
    body: JSON.stringify({ appName }),
  });

export const getQuestions = () =>
  request<{ questions: Question[] }>("/questions");

export const createQuestion = (payload: {
  label: string;
  choices: string[];
  correctIndex: number;
}) =>
  request<{ id: number }>("/questions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateQuestion = (
  id: number,
  payload: {
    label: string;
    choices: string[];
    correctIndex: number;
  }
) =>
  request<{ ok: boolean; attemptsCleared: boolean }>(`/questions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteQuestion = (id: number) =>
  request<{ ok: boolean; attemptsCleared: boolean }>(`/questions/${id}`, {
    method: "DELETE",
  });

export const createAttempt = (payload: {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  answers: unknown[];
  questionsSnapshot: Question[];
  startedAt?: string;
}) =>
  request<{ id: number; createdAt: string }>("/attempts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAttempts = () =>
  request<{ attempts: Attempt[]; stats: Stats }>("/attempts");

export const getAttemptByEmail = (email: string) =>
  request<{ attempt: Attempt | null }>(
    `/attempts/by-email?email=${encodeURIComponent(email)}`
  );

export const deleteAttempt = (id: number) =>
  request<{ ok: boolean }>(`/attempts/${id}`, { method: "DELETE" });

export const adminLogin = (password: string) =>
  request<{ ok: boolean }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
