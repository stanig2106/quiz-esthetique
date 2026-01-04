import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Frame } from "@/components/frame";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createAttempt } from "@/lib/api";
import { saveProgress } from "@/lib/storage";
import { useQuizData } from "@/lib/useQuizData";
import { buildScoreImage, shareScoreImage } from "@/lib/share";
import { useProgress } from "@/lib/useProgress";
import { formatDuration, getDurationMs } from "@/lib/time";
import { AdminLink } from "@/components/admin-link";
import type { QuizAnswer } from "@/types";

const getScore = (answers: QuizAnswer[]) =>
  answers.reduce((sum, answer) => sum + (answer.isCorrect ? 1 : 0), 0);

export const Result = () => {
  const navigate = useNavigate();
  const { appName, questions, loading, error } = useQuizData();
  const { progress, setProgress } = useProgress();
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const score = useMemo(
    () => (progress ? getScore(progress.answers) : 0),
    [progress]
  );
  const durationMs = useMemo(
    () =>
      progress ? getDurationMs(progress.startedAt, progress.finishedAt) : null,
    [progress]
  );

  useEffect(() => {
    if (!progress) {
      navigate("/");
      return;
    }
    if (questions.length > 0 && progress.answers.length < questions.length) {
      navigate("/quiz");
    }
  }, [navigate, progress, questions.length]);

  useEffect(() => {
    if (!progress || loading || error) return;
    if (progress.submittedAttemptId) return;
    if (progress.answers.length !== questions.length) return;

    const submit = async () => {
      try {
        const response = await createAttempt({
          userFirstName: progress.user.firstName,
          userLastName: progress.user.lastName,
          userEmail: progress.user.email,
          score,
          totalQuestions: questions.length,
          answers: progress.answers,
          questionsSnapshot: questions,
          startedAt: progress.startedAt,
        });
        const updated = { ...progress, submittedAttemptId: response.id };
        setProgress(updated);
        saveProgress(updated);
      } catch {
        // Ignore submission errors for now.
      }
    };
    submit();
  }, [progress, loading, error, questions, score]);

  const handleShare = async () => {
    if (!progress) return;
    setSharing(true);
    const canvas = await buildScoreImage({
      appName,
      fullName: `${progress.user.firstName} ${progress.user.lastName}`,
      score,
      total: questions.length,
      duration: formatDuration(durationMs),
    });
    if (canvas) {
      await shareScoreImage(canvas);
    }
    setSharing(false);
  };

  const handleDownload = async () => {
    if (!progress) return;
    setDownloading(true);
    const canvas = await buildScoreImage({
      appName,
      fullName: `${progress.user.firstName} ${progress.user.lastName}`,
      score,
      total: questions.length,
      duration: formatDuration(durationMs),
    });
    if (canvas) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((out) => resolve(out), "image/png")
      );
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "score.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    }
    setDownloading(false);
  };


  if (loading) {
    return (
      <PageShell variant="blue">
        <Frame title="Chargement">
          <Badge variant="secondary">Calcul du score...</Badge>
        </Frame>
      </PageShell>
    );
  }

  if (!progress || error) {
    return (
      <PageShell variant="blue">
        <Frame title="Resultat indisponible">
          <Badge variant="destructive">{error || "Aucune tentative"}</Badge>
        </Frame>
      </PageShell>
    );
  }

  return (
    <PageShell variant="blue">
      <Frame title="Bien joué !" subtitle="Tu as terminé le quiz">
        <div className="space-y-6 text-center">
          <p className="text-3xl font-semibold text-slate-900">
            Score final : {score} / {questions.length}
          </p>
          <p className="text-lg font-semibold text-slate-700">
            Temps : {formatDuration(durationMs)}
          </p>
          <p className="text-lg font-semibold text-slate-700">
            Merci {progress.user.firstName} {progress.user.lastName} !
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={handleShare} disabled={sharing}>
              {sharing ? "Création de l'image..." : "Partager mon score"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? "Téléchargement..." : "Télécharger l'image"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.assign("/leaderboard")}
            >
              Voir le leaderboard
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="grid gap-4">
          {questions.map((question, index) => {
            const answer = progress.answers[index];
            const selectedLabel = answer
              ? question.choices[answer.selectedIndex]
              : "Non répondu";
            return (
              <div
                key={question.id}
                className="rounded-2xl border-2 border-slate-900/40 bg-white px-4 py-3"
              >
                <p className="font-semibold text-slate-900">
                  {index + 1}. {question.label}
                </p>
                <p className="text-sm text-slate-700">
                  Ta réponse : {selectedLabel}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  Bonne réponse : {question.choices[question.correctIndex]}
                </p>
              </div>
            );
          })}
        </div>
      </Frame>
      <div className="pointer-events-none fixed top-2 right-6 z-50">
        <AdminLink />
      </div>
    </PageShell>
  );
};
