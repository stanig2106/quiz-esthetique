import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FrameProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export const Frame = ({ title, subtitle, children, className }: FrameProps) => {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-4xl rounded-[32px] bg-white/85 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] frame-border",
        className
      )}
    >
      {title ? (
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-lg font-semibold text-slate-800">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};
