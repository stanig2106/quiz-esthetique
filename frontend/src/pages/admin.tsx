import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { Frame } from "@/components/frame";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createQuestion,
  deleteQuestion,
  getAttempts,
  getQuestions,
  getSettings,
  updateQuestion,
  updateSettings,
  deleteAttempt,
} from "@/lib/api";
import { isAdminAuthed } from "@/lib/adminAuth";
import { formatDuration } from "@/lib/time";
import type { Attempt, Question, Stats } from "@/types";

const emptyQuestion = {
  label: "",
  choices: ["", "", "", ""],
  correctIndex: 0,
};

export const Admin = () => {
  const handleBackHome = () => {
    window.location.href = "/";
  };
  const [appName, setAppName] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [correctInput, setCorrectInput] = useState("1");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);

  const loadData = async () => {
    const [settings, questionsRes, attemptsRes] = await Promise.all([
      getSettings(),
      getQuestions(),
      getAttempts(),
    ]);
    setAppName(settings.appName);
    setQuestions(questionsRes.questions);
    setAttempts(attemptsRes.attempts);
    setStats(attemptsRes.stats);
  };

  useEffect(() => {
    if (!isAdminAuthed()) {
      window.location.href = "/";
      return;
    }
    loadData().catch(() => null);
  }, []);

  const resetForm = () => {
    setQuestionForm(emptyQuestion);
    setCorrectInput("1");
    setEditingId(null);
  };

  const handleSaveSettings = async () => {
    await updateSettings(appName);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleQuestionSubmit = async () => {
    if (!questionForm.label.trim()) return;
    if (questionForm.choices.filter(Boolean).length < 2) return;

    if (editingId) {
      setConfirmText(
        "Modifier une question supprimera toutes les tentatives precedentes."
      );
      setConfirmAction(() => async () => {
        await updateQuestion(editingId, questionForm);
        await loadData();
        resetForm();
      });
      setConfirmOpen(true);
      return;
    }

    await createQuestion(questionForm);
    await loadData();
    resetForm();
  };

  const handleEdit = (question: Question) => {
    setQuestionForm({
      label: question.label,
      choices: [...question.choices],
      correctIndex: question.correctIndex,
    });
    setCorrectInput(String(question.correctIndex + 1));
    setEditingId(question.id);
  };

  const handleDelete = (questionId: number) => {
    setConfirmText(
      "Supprimer une question supprimera toutes les tentatives precedentes."
    );
    setConfirmAction(() => async () => {
      await deleteQuestion(questionId);
      await loadData();
      resetForm();
    });
    setConfirmOpen(true);
  };

  const handleDeleteAttempt = (attemptId: number) => {
    setConfirmText("Supprimer cette réponse ? Cette action est définitive.");
    setConfirmAction(() => async () => {
      await deleteAttempt(attemptId);
      await loadData();
    });
    setConfirmOpen(true);
  };

  const statsCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Total de réponses", value: stats.total },
      { label: "Moyenne", value: stats.average.toFixed(2) },
      { label: "Médiane", value: stats.median.toFixed(2) },
      { label: "Minimum", value: stats.min },
      { label: "Maximum", value: stats.max },
      {
        label: "Temps moyen",
        value: formatDuration(stats.averageDurationMs ?? 0),
      },
    ];
  }, [stats]);

  const distributionEntries = useMemo(
    () => Object.entries(stats?.distribution ?? {}),
    [stats]
  );


  return (
    <PageShell variant="blue">
      <Frame title="Configuration" subtitle="Espace administrateur">
        <div className="mb-6 flex justify-center">
          <Button variant="outline" onClick={handleBackHome}>
            Retour au quiz
          </Button>
        </div>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="attempts">Réponses</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <Label htmlFor="appName">Nom de l'application</Label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setAppName(event.target.value)
                  }
                />
              </div>
              <Button onClick={handleSaveSettings}>Enregistrer</Button>
            </div>
            {settingsSaved ? (
              <Badge variant="secondary">Paramètres sauvegardés</Badge>
            ) : null}
            <Separator />
            <div className="grid gap-3 sm:grid-cols-3">
              {statsCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border-2 border-slate-900/40 bg-white px-4 py-3 text-center"
                >
                  <p className="text-sm font-semibold text-slate-600">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <div className="rounded-2xl border-2 border-slate-900/40 bg-white p-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingId ? "Modifier la question" : "Ajouter une question"}
              </h3>
              <div className="mt-4 grid gap-4">
                <div>
                  <Label>Question</Label>
                  <Textarea
                    value={questionForm.label}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        label: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {questionForm.choices.map((choice, index) => (
                    <div key={index}>
                      <Label>Réponse {index + 1}</Label>
                      <Input
                        value={choice}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setQuestionForm((prev) => {
                            const choices = [...prev.choices];
                            choices[index] = event.target.value;
                            return { ...prev, choices };
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Numéro de la bonne réponse (1-4)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={questionForm.choices.length}
                    value={correctInput}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setCorrectInput(event.target.value)
                    }
                    onBlur={() => {
                      const raw = Number(correctInput);
                      if (Number.isNaN(raw)) {
                        setCorrectInput(String(questionForm.correctIndex + 1));
                        return;
                      }
                      const max = questionForm.choices.length || 4;
                      const clamped = Math.min(Math.max(raw, 1), max);
                      setQuestionForm((prev) => ({
                        ...prev,
                        correctIndex: clamped - 1,
                      }));
                      setCorrectInput(String(clamped));
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleQuestionSubmit}>
                    {editingId ? "Sauvegarder" : "Ajouter"}
                  </Button>
                  {editingId ? (
                    <Button variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="rounded-2xl border-2 border-slate-900/40 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {question.label}
                      </p>
                      <p className="text-sm text-slate-600">
                        Bonne réponse :{" "}
                        {question.choices[question.correctIndex]}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleEdit(question)}>
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(question.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attempts" className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {distributionEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border-2 border-slate-900/40 bg-white px-4 py-3 text-center"
                >
                  <p className="text-sm font-semibold text-slate-600">{key}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Number(value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="rounded-2xl border-2 border-slate-900/40 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {attempt.userFirstName} {attempt.userLastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {attempt.userEmail}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {attempt.score} / {attempt.totalQuestions}
                      </Badge>
                      <Badge variant="outline">
                        Temps : {formatDuration(attempt.durationMs)}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Détails</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Détail de la réponse</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm font-semibold text-slate-600">
                            Temps total : {formatDuration(attempt.durationMs)}
                          </p>
                          <div className="space-y-3">
                            {attempt.questionsSnapshot.map((question, index) => {
                              const answer = attempt.answers[index];
                              const selectedLabel = answer
                                ? question.choices[answer.selectedIndex]
                                : "Non répondu";
                              return (
                                <div
                                  key={question.id}
                                  className="rounded-xl border-2 border-slate-900/40 bg-white px-3 py-2"
                                >
                                  <p className="font-semibold text-slate-900">
                                    {index + 1}. {question.label}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    Réponse : {selectedLabel}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-600">
                                    Bonne réponse :{" "}
                                    {question.choices[question.correctIndex]}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteAttempt(attempt.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Frame>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la modification</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmAction) {
                  await confirmAction();
                }
                setConfirmOpen(false);
              }}
            >
              Continuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
};
