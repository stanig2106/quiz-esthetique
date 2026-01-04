import { useEffect, useState } from "react";
import { getQuestions, getSettings } from "@/lib/api";
import type { Question } from "@/types";

export const useQuizData = () => {
  const [appName, setAppName] = useState("QCM");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [settings, questionsRes] = await Promise.all([
          getSettings(),
          getQuestions(),
        ]);
        if (!mounted) return;
        setAppName(settings.appName);
        setQuestions(questionsRes.questions);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { appName, questions, loading, error };
};
