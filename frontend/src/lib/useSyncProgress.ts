import { useEffect } from "react";
import { getAttemptByEmail } from "@/lib/api";
import { clearProgress, loadProgress, saveProgress } from "@/lib/storage";

export const useSyncProgress = () => {
  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const progress = loadProgress();
      if (!progress?.user?.email) return;

      try {
        const response = await getAttemptByEmail(progress.user.email);
        if (!mounted) return;
        if (!response.attempt) {
          if (progress.submittedAttemptId) {
            clearProgress();
          }
          return;
        }
        const attempt = response.attempt;
        saveProgress({
          user: {
            firstName: attempt.userFirstName,
            lastName: attempt.userLastName,
            email: attempt.userEmail,
          },
          answers: attempt.answers,
          currentIndex: attempt.answers.length,
          startedAt: attempt.startedAt || attempt.createdAt,
          finishedAt: attempt.finishedAt || attempt.createdAt,
          submittedAttemptId: attempt.id,
        });
      } catch {
        // Ignore sync errors.
      }
    };

    sync();
    return () => {
      mounted = false;
    };
  }, []);
};
