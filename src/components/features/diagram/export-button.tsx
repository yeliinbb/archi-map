"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
}

export function ExportButton({ targetRef }: ExportButtonProps) {
  const t = useTranslations("diagram");

  const handleExport = useCallback(async () => {
    if (!targetRef.current) return;

    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(targetRef.current, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = "archi-curation-diagram.png";
    link.href = dataUrl;
    link.click();
  }, [targetRef]);

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-micro tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Download className="h-3 w-3" />
      {t("exportPng")}
    </button>
  );
}
