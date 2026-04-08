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
  "arch-tadao-ando": {
    color: "oklch(0.55 0.12 280)",
    hex: "#4a4a9e",
    label: "Ando",
  },
  "arch-zaha-hadid": {
    color: "oklch(0.6 0.18 340)",
    hex: "#b84a7a",
    label: "Hadid",
  },
  "arch-peter-zumthor": {
    color: "oklch(0.62 0.08 60)",
    hex: "#8a7a5a",
    label: "Zumthor",
  },
  "arch-herzog-de-meuron": {
    color: "oklch(0.58 0.14 200)",
    hex: "#3a7a8a",
    label: "HdM",
  },
  "arch-renzo-piano": {
    color: "oklch(0.65 0.16 120)",
    hex: "#5a9a3a",
    label: "Piano",
  },
  "arch-le-corbusier": {
    color: "oklch(0.6 0.1 30)",
    hex: "#9a6a5a",
    label: "Le Corbusier",
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
