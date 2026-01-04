export const formatDuration = (durationMs?: number | null) => {
  if (!durationMs || durationMs < 0) return "00:00";
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const getDurationMs = (startedAt?: string, finishedAt?: string) => {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return null;
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  if (Number.isNaN(end)) return null;
  return Math.max(0, end - start);
};
