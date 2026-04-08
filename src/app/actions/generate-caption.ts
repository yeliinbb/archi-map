"use server";

import { generateText } from "@/lib/ai/gemini";
import type { Building, Architect } from "@/types";

type CaptionResult = {
  caption: string | null;
  error?: string;
};

export const generateCurationCaption = async (
  buildings: Building[],
  architects: Architect[],
  locale: string,
): Promise<CaptionResult> => {
  if (buildings.length === 0) {
    return { caption: null, error: "No buildings selected" };
  }

  const buildingList = buildings
    .map((b) => `- ${b.name} (${b.year}, ${b.typology ?? "Architecture"})`)
    .join("\n");

  const architectList = architects
    .map((a) => `- ${a.name} (${a.nationality})`)
    .join("\n");

  const lang = locale === "ko" ? "Korean" : "English";

  const prompt = `You are a knowledgeable architecture curator. Given this selection of buildings, write a short curation caption (2-3 sentences) that explains the thematic connection between them. Write in ${lang}.

Buildings:
${buildingList}

Architects:
${architectList}

Write only the caption, no titles or labels. Be poetic but precise, in the style of an architecture exhibition wall text.`;

  const caption = await generateText(prompt);
  if (!caption) {
    return { caption: null, error: "AI generation failed" };
  }

  return { caption };
};
