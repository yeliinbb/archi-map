"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { LAYOUT_CONFIGS, type LayoutMode } from "./layouts";

interface LayoutControlsProps {
  current: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

export function LayoutControls({ current, onChange }: LayoutControlsProps) {
  const t = useTranslations("diagram.layout");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const analysisLayouts = LAYOUT_CONFIGS.filter((l) => l.group === "analysis");
  const graphicsLayouts = LAYOUT_CONFIGS.filter((l) => l.group === "graphics");

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <>
      {/* Mobile: dropdown selector */}
      <div ref={dropdownRef} className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 border border-foreground bg-foreground px-3 py-1.5 font-mono text-micro tracking-wider text-background"
        >
          {t(current)}
          <ChevronDown className="h-3 w-3" />
        </button>
        {open ? (
          <div className="absolute left-0 top-full z-50 mt-1 border border-border bg-background shadow-sm">
            <p className="px-3 py-1.5 font-mono text-micro tracking-sublabel text-muted-foreground/50 uppercase">
              Analysis
            </p>
            {analysisLayouts.map((mode) => (
              <button
                key={mode.name}
                type="button"
                onClick={() => {
                  onChange(mode.name);
                  setOpen(false);
                }}
                className={`block w-full whitespace-nowrap px-3 py-1.5 text-left font-mono text-micro tracking-wider transition-colors ${
                  current === mode.name
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {t(mode.name)}
              </button>
            ))}
            <p className="border-t border-border px-3 py-1.5 font-mono text-micro tracking-sublabel text-muted-foreground/50 uppercase">
              Graphics
            </p>
            {graphicsLayouts.map((mode) => (
              <button
                key={mode.name}
                type="button"
                onClick={() => {
                  onChange(mode.name);
                  setOpen(false);
                }}
                className={`block w-full whitespace-nowrap px-3 py-1.5 text-left font-mono text-micro tracking-wider transition-colors ${
                  current === mode.name
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {t(mode.name)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: inline button groups */}
      <div className="hidden items-center gap-2 sm:flex">
        <div className="flex gap-px border border-border">
          {analysisLayouts.map((mode) => (
            <button
              key={mode.name}
              type="button"
              onClick={() => onChange(mode.name)}
              className={`whitespace-nowrap px-3 py-1.5 font-mono text-micro tracking-wider transition-colors ${
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
              className={`whitespace-nowrap px-3 py-1.5 font-mono text-micro tracking-wider transition-colors ${
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
    </>
  );
}
