import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  variant?: "green" | "pink" | "blue";
  children: ReactNode;
  className?: string;
};

const variantMap = {
  green: "bg-quiz-green",
  pink: "bg-quiz-pink",
  blue: "bg-quiz-blue",
};

export const PageShell = ({
  variant = "green",
  children,
  className,
}: PageShellProps) => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-swirls px-4 py-10 sm:px-8",
        variantMap[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
