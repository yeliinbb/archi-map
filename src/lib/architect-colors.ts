export const ARCHITECT_COLORS: Record<
  string,
  { color: string; hex: string; label: string }
> = {
  "arch-lina-bo-bardi": {
    color: "oklch(0.65 0.2 25)",
    hex: "#c44d3a",
    label: "Bo Bardi",
  },
  "arch-sanaa": {
    color: "oklch(0.65 0.15 250)",
    hex: "#3a6dc4",
    label: "SANAA",
  },
  "arch-alvaro-siza": {
    color: "oklch(0.72 0.12 85)",
    hex: "#a89340",
    label: "Siza",
  },
  "arch-john-pawson": {
    color: "oklch(0.68 0.1 155)",
    hex: "#4a9e6e",
    label: "Pawson",
  },
};

const FALLBACK_COLOR = "oklch(0.5 0 0)";
const FALLBACK_HEX = "#808080";

export function getArchitectColor(architectId: string): string {
  return ARCHITECT_COLORS[architectId]?.color ?? FALLBACK_COLOR;
}

export function getArchitectHex(architectId: string): string {
  return ARCHITECT_COLORS[architectId]?.hex ?? FALLBACK_HEX;
}
