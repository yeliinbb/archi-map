"use client";

export type LayoutMode = "force" | "timeline" | "geography";

interface LayoutControlsProps {
  current: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

const MODES: { value: LayoutMode; label: string }[] = [
  { value: "force", label: "Force" },
  { value: "timeline", label: "Timeline" },
  { value: "geography", label: "Geography" },
];

export function LayoutControls({ current, onChange }: LayoutControlsProps) {
  return (
    <div className="flex gap-px border border-border">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`px-3 py-1.5 font-mono text-micro tracking-wider transition-colors ${
            current === mode.value
              ? "bg-foreground text-background"
              : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
