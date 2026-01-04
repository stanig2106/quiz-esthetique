import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Frame } from "@/components/frame";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveProgress } from "@/lib/storage";
import { useQuizData } from "@/lib/useQuizData";
import { useProgress } from "@/lib/useProgress";
import type { Question, QuizAnswer } from "@/types";

export const Quiz = () => {
  const navigate = useNavigate();
  const { appName, questions, loading, error } = useQuizData();
  const { progress, setProgress } = useProgress();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (!progress) {
      navigate("/");
      return;
    }
    if (questions.length > 0 && progress.currentIndex >= questions.length) {
      navigate("/result");
    }
  }, [navigate, progress, questions.length]);

  useEffect(() => {
    if (!progress) return;
    if (!showAnswer && progress.currentIndex !== progress.answers.length) {
      setProgress({ ...progress, currentIndex: progress.answers.length });
      return;
    }
    saveProgress(progress);
  }, [progress, setProgress, showAnswer]);

  const currentQuestion = useMemo<Question | null>(() => {
    if (!progress) return null;
    return questions[progress.currentIndex] || null;
  }, [progress, questions]);

  const handleSelect = (index: number) => {
    if (!progress || !currentQuestion || showAnswer) return;
    const isCorrect = index === currentQuestion.correctIndex;
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedIndex: index,
      correctIndex: currentQuestion.correctIndex,
      isCorrect,
    };
    setSelectedIndex(index);
    setShowAnswer(true);
    setProgress({
      ...progress,
      answers: [...progress.answers, answer],
    });
  };

  const handleNext = () => {
    if (!progress) return;
    const nextIndex = progress.currentIndex + 1;
    if (nextIndex >= questions.length) {
      setProgress({ ...progress, currentIndex: nextIndex });
      navigate("/result");
      return;
    }
    setProgress({ ...progress, currentIndex: nextIndex });
    setSelectedIndex(null);
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <PageShell variant="pink">
        <Frame title={appName}>
          <Badge variant="secondary">Chargement du quiz...</Badge>
        </Frame>
      </PageShell>
    );
  }

  if (error || !currentQuestion) {
    return (
      <PageShell variant="pink">
        <Frame title="Quiz indisponible">
          <Badge variant="destructive">
            {error || "Aucune question disponible"}
          </Badge>
        </Frame>
      </PageShell>
    );
  }

  const number = progress?.currentIndex ? progress.currentIndex + 1 : 1;

  return (
    <PageShell variant="pink">
      <Frame title={`Question ${number}`} subtitle={appName}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              {currentQuestion.label}
            </p>
            {showAnswer ? (
              <div className="mt-4 space-y-2">
                <Badge variant={currentQuestion.correctIndex === selectedIndex ? "default" : "destructive"}>
                  {currentQuestion.correctIndex === selectedIndex
                    ? "Bonne réponse !"
                    : "Mauvaise réponse"}
                </Badge>
                <p className="text-base font-semibold text-slate-700">
                  Bonne réponse :{" "}
                  {currentQuestion.choices[currentQuestion.correctIndex]}
                </p>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3">
            {currentQuestion.choices.map((choice, index) => {
              const isSelected = selectedIndex === index;
              const isCorrect = currentQuestion.correctIndex === index;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleSelect(index)}
                  className={cn(
                    "w-full rounded-xl border-2 border-slate-900/60 bg-white px-4 py-3 text-left font-semibold transition",
                    showAnswer && isSelected && isCorrect && "bg-emerald-100",
                    showAnswer && isSelected && !isCorrect && "bg-rose-100",
                    showAnswer && !isSelected && isCorrect && "bg-emerald-50",
                    showAnswer ? "cursor-default opacity-90" : "hover:-translate-y-0.5 hover:bg-white/80"
                  )}
                  disabled={showAnswer}
                >
                  {String.fromCharCode(65 + index)}: {choice}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Badge variant="secondary">
            {number} / {questions.length}
          </Badge>
          <Button onClick={handleNext} disabled={!showAnswer}>
            {number === questions.length ? "Voir le score" : "Suivant"}
          </Button>
        </div>
      </Frame>
    </PageShell>
  );
};
