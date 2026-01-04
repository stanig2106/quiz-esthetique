import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import healthRoutes from "./routes/health.js";
import settingsRoutes from "./routes/settings.js";
import questionsRoutes from "./routes/questions.js";
import attemptsRoutes from "./routes/attempts.js";
import adminRoutes from "./routes/admin.js";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", healthRoutes);
app.use("/api", settingsRoutes);
app.use("/api", questionsRoutes);
app.use("/api", attemptsRoutes);
app.use("/api", adminRoutes);

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
