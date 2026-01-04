import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Frame } from "@/components/frame";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { saveProgress } from "@/lib/storage";
import { useQuizData } from "@/lib/useQuizData";
import { useProgress } from "@/lib/useProgress";
import { AdminLink } from "@/components/admin-link";
import type { QuizUser } from "@/types";

export const Landing = () => {
  const navigate = useNavigate();
  const { appName, questions, loading, error } = useQuizData();
  const { progress } = useProgress();
  const existing = useMemo(() => progress, [progress]);
  const [form, setForm] = useState<QuizUser>({
    firstName: existing?.user.firstName || "",
    lastName: existing?.user.lastName || "",
    email: existing?.user.email || "",
  });

  const isComplete = Boolean(
    existing &&
      questions.length > 0 &&
      existing.answers.length >= questions.length
  );
  const canResume = Boolean(
    existing && existing.answers.length > 0 && !isComplete
  );
  const isFormValid = Boolean(form.firstName && form.lastName && form.email);

  const handleStart = () => {
    if (!form.firstName || !form.lastName || !form.email) return;
    const progress = {
      user: form,
      currentIndex: 0,
      answers: [],
      startedAt: new Date().toISOString(),
    };
    saveProgress(progress);
    navigate("/rules");
  };

  const handleResume = () => {
    navigate("/quiz");
  };

  const handleViewResult = () => {
    navigate("/result");
  };

  useEffect(() => {
    if (isComplete) {
      navigate("/result");
    }
  }, [isComplete, navigate]);


  return (
    <PageShell variant="green">
      <Frame
        title={appName}
        subtitle="Indique ici ton nom, prénom et email"
        className="space-y-6"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="firstName">Prenom</Label>
            <Input
              id="firstName"
              placeholder="Prenom"
              value={form.firstName}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, firstName: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              placeholder="Nom"
              value={form.lastName}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, lastName: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@email.com"
              value={form.email}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </div>
        </div>

        {loading ? (
          <Badge variant="secondary">Chargement des questions...</Badge>
        ) : error ? (
          <Badge variant="destructive">{error}</Badge>
        ) : (
          <Badge variant="secondary">
            {questions.length} questions prêtes
          </Badge>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={handleStart}
            className="font-display text-lg"
            disabled={!isFormValid}
          >
            Commencer le quiz
          </Button>
          {canResume ? (
            <Button
              variant="outline"
              onClick={handleResume}
              className="font-display text-lg"
            >
              Reprendre le quiz
            </Button>
          ) : null}
          {isComplete ? (
            <Button
              variant="outline"
              onClick={handleViewResult}
              className="font-display text-lg"
            >
              Voir le score
            </Button>
          ) : null}
        </div>
      </Frame>
      <div className="pointer-events-none fixed top-2 right-6 z-50">
        <AdminLink />
      </div>
    </PageShell>
  );
};
