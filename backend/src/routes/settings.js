import { Router } from "express";
import { get, run } from "../db.js";

const router = Router();

router.get("/settings", async (_req, res) => {
  const settings = await get("SELECT app_name FROM settings WHERE id = 1");
  res.json({ appName: settings?.app_name || "QCM" });
});

router.put("/settings", async (req, res) => {
  const { appName } = req.body || {};
  if (!appName || typeof appName !== "string") {
    res.status(400).json({ error: "appName requis" });
    return;
  }
  await run("UPDATE settings SET app_name = ? WHERE id = 1", [appName]);
  res.json({ appName });
});

export default router;
