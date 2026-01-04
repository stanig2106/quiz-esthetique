import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

const PORT = process.env.PORT || 3001;
const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), "data");
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "qcm.sqlite");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

const initDb = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      app_name TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      choices TEXT NOT NULL,
      correct_index INTEGER NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_first_name TEXT NOT NULL,
      user_last_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      started_at TEXT,
      finished_at TEXT,
      duration_ms INTEGER,
      created_at TEXT NOT NULL
    )
  `);

  const attemptColumns = await all("PRAGMA table_info(attempts)");
  const hasColumn = (name) => attemptColumns.some((col) => col.name === name);
  if (!hasColumn("started_at")) {
    await run("ALTER TABLE attempts ADD COLUMN started_at TEXT");
  }
  if (!hasColumn("finished_at")) {
    await run("ALTER TABLE attempts ADD COLUMN finished_at TEXT");
  }
  if (!hasColumn("duration_ms")) {
    await run("ALTER TABLE attempts ADD COLUMN duration_ms INTEGER");
  }

  const settingsCount = await get(
    "SELECT COUNT(*) as count FROM settings"
  );
  if (!settingsCount || settingsCount.count === 0) {
    await run("INSERT INTO settings (id, app_name) VALUES (1, ?)", [
      "Esthétique Quiz",
    ]);
  }

  const questionsCount = await get(
    "SELECT COUNT(*) as count FROM questions"
  );
  if (!questionsCount || questionsCount.count === 0) {
    const seed = [
      {
        label: "Quelle est la couche la plus externe de la peau ?",
        choices: ["Hypoderme", "Derme", "Épiderme", "Mélanine"],
        correctIndex: 2,
      },
      {
        label: "Quel est le rôle principal de la mélanine ?",
        choices: [
          "Hydrater la peau",
          "Protéger des UV",
          "Réguler la température",
          "Former le collagène",
        ],
        correctIndex: 1,
      },
      {
        label: "Quel produit est le plus adapté pour nettoyer une peau sensible ?",
        choices: [
          "Gel exfoliant",
          "Savon décapant",
          "Lait nettoyant doux",
          "Gommage abrasif",
        ],
        correctIndex: 2,
      },
      {
        label: "Quelle vitamine est connue pour stimuler la production de collagène ?",
        choices: ["Vitamine A", "Vitamine B12", "Vitamine C", "Vitamine E"],
        correctIndex: 2,
      },
    ];

    for (const q of seed) {
      await run(
        "INSERT INTO questions (label, choices, correct_index) VALUES (?, ?, ?)",
        [q.label, JSON.stringify(q.choices), q.correctIndex]
      );
    }
  }
};

const clearAttempts = async () => {
  await run("DELETE FROM attempts");
};

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lundi";

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/settings", async (_req, res) => {
  const settings = await get("SELECT app_name FROM settings WHERE id = 1");
  res.json({ appName: settings?.app_name || "QCM" });
});

app.put("/api/settings", async (req, res) => {
  const { appName } = req.body || {};
  if (!appName || typeof appName !== "string") {
    res.status(400).json({ error: "appName requis" });
    return;
  }
  await run("UPDATE settings SET app_name = ? WHERE id = 1", [appName]);
  res.json({ appName });
});

app.get("/api/questions", async (_req, res) => {
  const rows = await all(
    "SELECT id, label, choices, correct_index FROM questions ORDER BY id ASC"
  );
  const questions = rows.map((row) => ({
    id: row.id,
    label: row.label,
    choices: JSON.parse(row.choices),
    correctIndex: row.correct_index,
  }));
  res.json({ questions });
});

app.post("/api/questions", async (req, res) => {
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
    [label, JSON.stringify(choices), correctIndex]
  );
  res.json({ id: result.lastID });
});

app.put("/api/questions/:id", async (req, res) => {
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
    [label, JSON.stringify(choices), correctIndex, id]
  );
  await clearAttempts();
  res.json({ ok: true, attemptsCleared: true });
});

app.delete("/api/questions/:id", async (req, res) => {
  const { id } = req.params;
  await run("DELETE FROM questions WHERE id = ?", [id]);
  await clearAttempts();
  res.json({ ok: true, attemptsCleared: true });
});

app.post("/api/attempts", async (req, res) => {
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
    ]
  );
  res.json({ id: result.lastID, createdAt, finishedAt, durationMs });
});

app.get("/api/attempts/by-email", async (req, res) => {
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
    [email]
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

app.get("/api/attempts", async (_req, res) => {
  const rows = await all(
    `
      SELECT id, user_first_name, user_last_name, user_email, score, total_questions, answers_json, questions_json, started_at, finished_at, duration_ms, created_at
      FROM attempts
      ORDER BY duration_ms IS NULL, duration_ms ASC, created_at DESC
    `
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

app.delete("/api/attempts/:id", async (req, res) => {
  const { id } = req.params;
  await run("DELETE FROM attempts WHERE id = ?", [id]);
  res.json({ ok: true });
});

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ ok: false });
    return;
  }
  res.json({ ok: true });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API ready on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB init failed", err);
    process.exit(1);
  });
