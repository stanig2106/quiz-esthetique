import { useNavigate } from "react-router-dom";
import { Frame } from "@/components/frame";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useQuizData } from "@/lib/useQuizData";

export const Rules = () => {
  const navigate = useNavigate();
  const { appName, questions } = useQuizData();
  const questionCount = questions.length || 0;

  return (
    <PageShell variant="green">
      <Frame title="Règle du jeu" subtitle={appName}>
        <div className="mx-auto max-w-2xl space-y-6 text-center text-lg font-semibold text-slate-900">
          <p>
            C'est très simple ! Tu dois répondre à {questionCount} questions,
            toutes n'ont qu'une seule réponse possible.
          </p>
          <p>
            Tu es chronométré dans le futur, donc la personne ayant eu le plus
            de bonnes réponses en un temps record gagnera un cadeau !
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate("/quiz")}
            className="rounded-full px-8 py-6 text-lg font-bold"
          >
            Page suivante →
          </Button>
        </div>
      </Frame>
    </PageShell>
  );
};
