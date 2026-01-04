import { Router } from "express";
import { all, clearAttempts, run } from "../db.js";

const router = Router();

router.get("/questions", async (_req, res) => {
  const rows = await all(
    "SELECT id, label, choices, correct_index FROM questions ORDER BY id ASC",
  );
  const questions = rows.map((row) => ({
    id: row.id,
    label: row.label,
    choices: JSON.parse(row.choices),
    correctIndex: row.correct_index,
  }));
  res.json({ questions });
});

router.post("/questions", async (req, res) => {
  const { label, choices, correctIndex } = req.body || {};
  if (
    !label ||
    !Array.isArray(choices) ||
    choices.length < 2 ||
    typeof correctIndex !== "number"
  ) {
    res.status(400).json({ error: "Question invalide" });
    return;
  }
  const result = await run(
    "INSERT INTO questions (label, choices, correct_index) VALUES (?, ?, ?)",
    [label, JSON.stringify(choices), correctIndex],
  );
  res.json({ id: result.lastID });
});

router.put("/questions/:id", async (req, res) => {
  const { id } = req.params;
  const { label, choices, correctIndex } = req.body || {};
  if (
    !label ||
    !Array.isArray(choices) ||
    choices.length < 2 ||
    typeof correctIndex !== "number"
  ) {
    res.status(400).json({ error: "Question invalide" });
    return;
  }
  await run(
    "UPDATE questions SET label = ?, choices = ?, correct_index = ? WHERE id = ?",
    [label, JSON.stringify(choices), correctIndex, id],
  );
  await clearAttempts();
  res.json({ ok: true, attemptsCleared: true });
});

router.delete("/questions/:id", async (req, res) => {
  const { id } = req.params;
  await run("DELETE FROM questions WHERE id = ?", [id]);
  await clearAttempts();
  res.json({ ok: true, attemptsCleared: true });
});

export default router;
