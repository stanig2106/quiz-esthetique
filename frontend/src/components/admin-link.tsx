import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminLogin } from "@/lib/api";
import { setAdminAuthed } from "@/lib/adminAuth";

export const AdminLink = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      await adminLogin(password);
      setAdminAuthed(true);
      window.location.href = "/admin";
    } catch {
      setError("Mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="text-xs font-semibold text-slate-700/40 opacity-60 transition hover:text-slate-900 hover:opacity-100">
            Espace admin
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Accès administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminPassword">Mot de passe</Label>
              <Input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>
            {error ? (
              <p className="text-sm font-semibold text-red-600">{error}</p>
            ) : null}
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Vérification..." : "Entrer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
