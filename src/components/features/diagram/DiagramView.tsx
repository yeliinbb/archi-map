"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link2, Sparkles, Tag, Download, Check } from "lucide-react";
import { NetworkDiagram } from "./NetworkDiagram";
import { LayoutControls } from "./LayoutControls";
import type { LayoutMode } from "./layouts";
import { ExportButton } from "./ExportButton";
import { buildDiagramGraph } from "@/lib/diagram/transform";
import { generateCurationCaption } from "@/app/actions/generate-caption";
import type { Building, Architect, City } from "@/types";

interface DiagramViewProps {
  buildings: Building[];
  architects: Architect[];
  cities: City[];
}

export function DiagramView({
  buildings,
  architects,
  cities,
}: DiagramViewProps) {
  const t = useTranslations("diagram");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<LayoutMode>("force");
  const [showLabels, setShowLabels] = useState(true);
  const [copied, setCopied] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS or denied permission
      const url = window.location.href;
      prompt("Copy this URL:", url);
    }
  }, []);

  const handleGenerateCaption = useCallback(async () => {
    setCaptionLoading(true);
    setCaption(null);
    const result = await generateCurationCaption(buildings, architects, locale);
    setCaption(result.caption);
    setCaptionLoading(false);
  }, [buildings, architects, locale]);

  const graph = useMemo(
    () => buildDiagramGraph(buildings, architects, cities),
    [buildings, architects, cities],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar row 1: title + layout modes */}
      <div className="border-b border-border px-3 py-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
            {t("title")}
          </p>
          <span className="hidden font-mono text-micro text-muted-foreground sm:inline">
            {t("stats", {
              buildings: buildings.length,
              architects: architects.length,
              cities: cities.length,
            })}
          </span>
        </div>
        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          <LayoutControls current={layout} onChange={setLayout} />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowLabels(!showLabels)}
              className={`border p-1.5 transition-colors sm:px-3 ${
                showLabels
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              title={t("labels")}
            >
              <Tag className="h-3.5 w-3.5 sm:hidden" />
              <span className="hidden font-mono text-micro tracking-wider sm:inline">
                {t("labels")}
              </span>
            </button>
            <button
              type="button"
              onClick={handleGenerateCaption}
              disabled={captionLoading}
              className="border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 md:hidden sm:px-3"
              title={t("captionGenerate")}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
            <ExportButton targetRef={containerRef} />
            <button
              type="button"
              onClick={handleShare}
              className="border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3"
              title={copied ? t("copied") : t("share")}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-foreground" />
              ) : (
                <Link2 className="h-3.5 w-3.5 sm:hidden" />
              )}
              <span className="hidden font-mono text-micro tracking-wider sm:inline">
                {copied ? t("copied") : t("share")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Caption banner (mobile) */}
      {caption ? (
        <div className="border-b border-border bg-background p-3 md:hidden">
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            {caption}
          </p>
        </div>
      ) : null}

      {/* Diagram */}
      <div ref={containerRef} className="relative flex-1">
        {dimensions.width > 0 && dimensions.height > 0 ? (
          <NetworkDiagram
            graph={graph}
            layout={layout}
            width={dimensions.width}
            height={dimensions.height}
            showLabels={showLabels}
          />
        ) : null}

        {/* AI Caption overlay — desktop only */}
        <div className="absolute bottom-4 left-4 right-4 z-10 hidden items-end gap-3 md:flex">
          <button
            type="button"
            onClick={handleGenerateCaption}
            disabled={captionLoading}
            className="flex shrink-0 items-center gap-2 border border-border bg-background/90 px-3 py-1.5 font-mono text-micro tracking-wider text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            {captionLoading ? t("captionLoading") : t("captionGenerate")}
          </button>
          {caption ? (
            <div className="max-w-md border border-border bg-background/90 p-3 backdrop-blur-sm">
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                {caption}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
