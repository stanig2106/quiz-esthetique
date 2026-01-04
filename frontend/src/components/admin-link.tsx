import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
