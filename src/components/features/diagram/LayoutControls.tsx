"use client";

import { useTranslations } from "next-intl";
import { LAYOUT_CONFIGS, type LayoutMode } from "./layouts";

interface LayoutControlsProps {
  current: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

export function LayoutControls({ current, onChange }: LayoutControlsProps) {
  const t = useTranslations("diagram.layout");

  const analysisLayouts = LAYOUT_CONFIGS.filter((l) => l.group === "analysis");
  const graphicsLayouts = LAYOUT_CONFIGS.filter((l) => l.group === "graphics");

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-px border border-border">
        {analysisLayouts.map((mode) => (
          <button
            key={mode.name}
            type="button"
            onClick={() => onChange(mode.name)}
            className={`px-2 py-1.5 font-mono text-micro tracking-wider transition-colors sm:px-3 ${
              current === mode.name
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {t(mode.name)}
          </button>
        ))}
      </div>
      <div className="flex gap-px border border-border">
        {graphicsLayouts.map((mode) => (
          <button
            key={mode.name}
            type="button"
            onClick={() => onChange(mode.name)}
            className={`px-2 py-1.5 font-mono text-micro tracking-wider transition-colors sm:px-3 ${
              current === mode.name
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {t(mode.name)}
          </button>
        ))}
      </div>
    </div>
  );
}
