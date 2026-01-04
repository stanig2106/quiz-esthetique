import { Router } from "express";
import { all, get, run } from "../db.js";

const router = Router();

router.post("/attempts", async (req, res) => {
  const {
    userFirstName,
    userLastName,
    userEmail,
    score,
    totalQuestions,
    answers,
    questionsSnapshot,
    startedAt,
  } = req.body || {};

  if (
    !userFirstName ||
    !userLastName ||
    !userEmail ||
    typeof score !== "number" ||
    typeof totalQuestions !== "number" ||
    !Array.isArray(answers) ||
    !Array.isArray(questionsSnapshot)
  ) {
    res.status(400).json({ error: "Tentative invalide" });
    return;
  }

  await run("DELETE FROM attempts WHERE user_email = ?", [userEmail]);

  const createdAt = new Date().toISOString();
  const finishedAt = createdAt;
  const startedAtDate = startedAt ? new Date(startedAt) : null;
  const durationMs =
    startedAtDate && !Number.isNaN(startedAtDate.getTime())
      ? Math.max(0, new Date(finishedAt).getTime() - startedAtDate.getTime())
      : null;
  const result = await run(
    `
      INSERT INTO attempts
      (user_first_name, user_last_name, user_email, score, total_questions, answers_json, questions_json, started_at, finished_at, duration_ms, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userFirstName,
      userLastName,
      userEmail,
      score,
      totalQuestions,
      JSON.stringify(answers),
      JSON.stringify(questionsSnapshot),
      startedAtDate ? startedAtDate.toISOString() : null,
      finishedAt,
      durationMs,
      createdAt,
    ],
  );
  res.json({ id: result.lastID, createdAt, finishedAt, durationMs });
});

router.get("/attempts/by-email", async (req, res) => {
  const email = req.query.email;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "email requis" });
    return;
  }

  const row = await get(
    `
      SELECT id, user_first_name, user_last_name, user_email, score, total_questions, answers_json, questions_json, started_at, finished_at, duration_ms, created_at
      FROM attempts
      WHERE user_email = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [email],
  );

  if (!row) {
    res.json({ attempt: null });
    return;
  }

  res.json({
    attempt: {
      id: row.id,
      userFirstName: row.user_first_name,
      userLastName: row.user_last_name,
      userEmail: row.user_email,
      score: row.score,
      totalQuestions: row.total_questions,
      answers: JSON.parse(row.answers_json),
      questionsSnapshot: JSON.parse(row.questions_json),
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      durationMs: row.duration_ms,
      createdAt: row.created_at,
    },
  });
});

router.get("/attempts", async (_req, res) => {
  const rows = await all(
    `
      SELECT id, user_first_name, user_last_name, user_email, score, total_questions, answers_json, questions_json, started_at, finished_at, duration_ms, created_at
      FROM attempts
      ORDER BY duration_ms IS NULL, duration_ms ASC, created_at DESC
    `,
  );
  const attempts = rows.map((row) => ({
    id: row.id,
    userFirstName: row.user_first_name,
    userLastName: row.user_last_name,
    userEmail: row.user_email,
    score: row.score,
    totalQuestions: row.total_questions,
    answers: JSON.parse(row.answers_json),
    questionsSnapshot: JSON.parse(row.questions_json),
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  }));

  const scores = attempts.map((attempt) => attempt.score).sort((a, b) => a - b);
  const total = scores.length;
  const average =
    total === 0 ? 0 : scores.reduce((sum, value) => sum + value, 0) / total;
  const median =
    total === 0
      ? 0
      : total % 2 === 1
        ? scores[Math.floor(total / 2)]
        : (scores[total / 2 - 1] + scores[total / 2]) / 2;
  const min = total === 0 ? 0 : scores[0];
  const max = total === 0 ? 0 : scores[total - 1];

  const durations = attempts
    .map((attempt) => attempt.durationMs)
    .filter((value) => typeof value === "number");
  const averageDurationMs =
    durations.length === 0
      ? 0
      : durations.reduce((sum, value) => sum + value, 0) / durations.length;

  const distribution = attempts.reduce((acc, attempt) => {
    const key = `${attempt.score}/${attempt.totalQuestions}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  res.json({
    attempts,
    stats: {
      total,
      average,
      median,
      min,
      max,
      averageDurationMs,
      distribution,
    },
  });
});

router.delete("/attempts/:id", async (req, res) => {
  const { id } = req.params;
  await run("DELETE FROM attempts WHERE id = ?", [id]);
  res.json({ ok: true });
});

export default router;
