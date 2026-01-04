import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), "data");
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "qcm.sqlite");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

export const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });

export const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

export const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

export const clearAttempts = async () => {
  await run("DELETE FROM attempts");
};

export const initDb = async () => {
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

  const settingsCount = await get("SELECT COUNT(*) as count FROM settings");
  if (!settingsCount || settingsCount.count === 0) {
    await run("INSERT INTO settings (id, app_name) VALUES (1, ?)", [
      "Esthétique Quiz",
    ]);
  }

  const questionsCount = await get("SELECT COUNT(*) as count FROM questions");
  if (!questionsCount || questionsCount.count === 0) {
    const seed = [
      {
        label: "Quelle fonction ne fait pas partie des fonctions de la peau ?",
        choices: [
          "Protection contre les agressions extérieures",
          "Production d'hormones sexuelles",
          "Régulation de la température",
        ],
        correctIndex: 1,
      },
      {
        label:
          "Quelle glande produit le sébum qui protège la peau et les cheveux ?",
        choices: ["Glande sudoripare", "Glande sébacée", "Glande lacrymale"],
        correctIndex: 1,
      },
      {
        label:
          "Quelle cellule de l'épiderme est responsable de la pigmentation de la peau ?",
        choices: ["Les kératinocytes", "Les mélanocytes", "Les fibroblastes"],
        correctIndex: 1,
      },
      {
        label:
          "Quel type de soin est principalement utilisé pour stimuler le renouvellement cellulaire de la couche cornée ?",
        choices: [
          "Le gommage/exfoliation",
          "L'hydratation",
          "La protection solaire",
        ],
        correctIndex: 0,
      },
      {
        label: "Lequel des énoncés suivants est vrai concernant les ongles ?",
        choices: [
          "Les ongles sont constitués de cellules mortes kératinisées",
          "Les ongles sont alimentés directement par des vaisseaux sanguins dans la lunule",
          "Les ongles repoussent grâce aux glandes sudoripares",
        ],
        correctIndex: 0,
      },
      {
        label:
          "Quelles sont les 3 couches de l’épiderme de la plus superficielle à la plus profonde ?",
        choices: [
          "Épiderme - derme - hypoderme",
          "Derme - épiderme - hypoderme",
          "Hypoderme - derme - épiderme",
        ],
        correctIndex: 0,
      },
      {
        label: "À quoi sert la jonction dermo-épidermique ?",
        choices: [
          "À faire circuler le sang",
          "Une zone d’échanges entre le derme et l’épiderme",
          "Une zone d’échanges entre l’hypoderme et le derme",
        ],
        correctIndex: 1,
      },
      {
        label: "Le corps est composé d'environ de combien de litres d’eau ?",
        choices: ["65%", "70%", "60%"],
        correctIndex: 2,
      },
      {
        label: "Quelles sont les 3 phases de la pousse du poil ?",
        choices: [
          "Anagène - catagène - télogène",
          "Catagène - anagène - télophase",
          "Anaphase - télophase - anaphase",
        ],
        correctIndex: 0,
      },
      {
        label: "Vrai ou faux : un produit de cosmétique sert à embellir ?",
        choices: ["Vrai", "Faux"],
        correctIndex: 1,
      },
    ];

    for (const q of seed) {
      await run(
        "INSERT INTO questions (label, choices, correct_index) VALUES (?, ?, ?)",
        [q.label, JSON.stringify(q.choices), q.correctIndex],
      );
    }
  }
};
