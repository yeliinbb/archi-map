export const ARCHITECT_COLORS: Record<string, { color: string; label: string }> =
  {
    "arch-lina-bo-bardi": { color: "oklch(0.65 0.2 25)", label: "Bo Bardi" },
    "arch-sanaa": { color: "oklch(0.65 0.15 250)", label: "SANAA" },
    "arch-alvaro-siza": { color: "oklch(0.72 0.12 85)", label: "Siza" },
    "arch-john-pawson": { color: "oklch(0.68 0.1 155)", label: "Pawson" },
  };

const FALLBACK_COLOR = "oklch(0.5 0 0)";

export function getArchitectColor(architectId: string): string {
  return ARCHITECT_COLORS[architectId]?.color ?? FALLBACK_COLOR;
}
