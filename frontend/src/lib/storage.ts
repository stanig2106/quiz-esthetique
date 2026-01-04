import type { QuizProgress } from "@/types";

const KEY = "qcm-progress-v1";
const EVENT = "qcm-progress";

const notify = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
};

export const loadProgress = (): QuizProgress | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuizProgress;
  } catch {
    return null;
  }
};

export const saveProgress = (progress: QuizProgress) => {
  const serialized = JSON.stringify(progress);
  if (localStorage.getItem(KEY) === serialized) return;
  localStorage.setItem(KEY, serialized);
  notify();
};

export const clearProgress = () => {
  if (localStorage.getItem(KEY) === null) return;
  localStorage.removeItem(KEY);
  notify();
};

export const onProgressChange = (callback: () => void) => {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
};
