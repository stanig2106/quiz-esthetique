import { useEffect, useState } from "react";
import { loadProgress, onProgressChange } from "@/lib/storage";
import type { QuizProgress } from "@/types";

export const useProgress = () => {
  const [progress, setProgress] = useState<QuizProgress | null>(() =>
    loadProgress()
  );

  useEffect(() => {
    const unsubscribe = onProgressChange(() => {
      setProgress(loadProgress());
    });
    return () => unsubscribe();
  }, []);

  return { progress, setProgress };
};
