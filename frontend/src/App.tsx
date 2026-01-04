import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Landing } from "@/pages/landing";
import { Rules } from "@/pages/rules";
import { Quiz } from "@/pages/quiz";
import { Result } from "@/pages/result";
import { Admin } from "@/pages/admin";
import { Leaderboard } from "@/pages/leaderboard";
import { useSyncProgress } from "@/lib/useSyncProgress";

const App = () => {
  useSyncProgress();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
