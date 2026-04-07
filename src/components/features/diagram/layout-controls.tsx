"use client";

import { useTranslations } from "next-intl";

export type LayoutMode = "force" | "timeline" | "geography";

interface LayoutControlsProps {
  current: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

const MODES: LayoutMode[] = ["force", "timeline", "geography"];

export function LayoutControls({ current, onChange }: LayoutControlsProps) {
  const t = useTranslations("diagram.layout");

  return (
    <div className="flex gap-px border border-border">
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`px-3 py-1.5 font-mono text-micro tracking-wider transition-colors ${
            current === mode
              ? "bg-foreground text-background"
              : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          {t(mode)}
        </button>
      ))}
    </div>
  );
}
