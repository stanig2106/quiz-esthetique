import { Router } from "express";

const router = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lundi";

router.post("/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ ok: false });
    return;
  }
  res.json({ ok: true });
});

export default router;
