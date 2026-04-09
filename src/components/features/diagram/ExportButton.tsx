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
      className="border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3"
      title={t("exportPng")}
    >
      <Download className="h-3.5 w-3.5 sm:hidden" />
      <span className="hidden font-mono text-micro tracking-wider sm:inline">{t("exportPng")}</span>
    </button>
  );
}
