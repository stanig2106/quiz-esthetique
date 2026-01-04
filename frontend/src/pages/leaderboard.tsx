import { Frame } from "@/components/frame";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAttempts } from "@/lib/api";
import { formatDuration } from "@/lib/time";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Attempt } from "@/types";

export const Leaderboard = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAttempts();
        setAttempts(response.attempts);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const leaderboard = useMemo(() => {
    return [...attempts].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aTime = a.durationMs ?? Number.POSITIVE_INFINITY;
      const bTime = b.durationMs ?? Number.POSITIVE_INFINITY;
      if (aTime !== bTime) return aTime - bTime;
      return String(a.createdAt).localeCompare(String(b.createdAt));
    });
  }, [attempts]);

  return (
    <PageShell variant="blue">
      <Frame title="Leaderboard" subtitle="Les meilleurs scores">
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate("/result")}>
            Retour
          </Button>
        </div>
        <Separator className="my-6" />
        {loading ? (
          <Badge variant="secondary">Chargement...</Badge>
        ) : (
          <div className="grid gap-4">
            {leaderboard.map((attempt, index) => (
              <div
                key={attempt.id}
                className="rounded-2xl border-2 border-slate-900/40 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="secondary">#{index + 1}</Badge>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {attempt.userFirstName} {attempt.userLastName}
                    </p>
                  </div>
                  <div className="ml-auto flex flex-wrap items-center gap-3">
                    <Badge variant="secondary">
                      {attempt.score} / {attempt.totalQuestions}
                    </Badge>
                    <Badge variant="outline">
                      Temps : {formatDuration(attempt.durationMs)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 ? (
              <Badge variant="secondary">Aucune réponse pour le moment</Badge>
            ) : null}
          </div>
        )}
      </Frame>
    </PageShell>
  );
};
