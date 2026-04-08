import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// --- Types ---

type CsvRow = Record<string, string>;

type ImageMeta = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  credit?: string;
};

type Tag = { label: string; slug: string };

const MAX_IMAGES = 5;

// --- CSV Parsing (simple, no external dep) ---

const parseCsv = (content: string): CsvRow[] => {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
};

// --- Helpers ---

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseTags = (raw: string): Tag[] => {
  if (!raw.trim()) return [];
  return raw.split(",").map((pair) => {
    const [label, slug] = pair.trim().split(":");
    return { label: label.trim(), slug: (slug ?? generateSlug(label)).trim() };
  });
};

const parseStringArray = (raw: string): string[] => {
  if (!raw.trim()) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
};

const toNumber = (val: string): number | undefined => {
  if (!val.trim()) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
};

const toOptionalString = (val: string): string | undefined =>
  val.trim() || undefined;

const reconstructImages = (row: CsvRow, prefix: string): ImageMeta[] =>
  Array.from({ length: MAX_IMAGES }, (_, i) => {
    const idx = i + 1;
    const src = row[`${prefix}_${idx}_src`];
    if (!src?.trim()) return null;
    return {
      src,
      alt: row[`${prefix}_${idx}_alt`] ?? "",
      width: toNumber(row[`${prefix}_${idx}_width`] ?? ""),
      height: toNumber(row[`${prefix}_${idx}_height`] ?? ""),
      credit: toOptionalString(row[`${prefix}_${idx}_credit`] ?? ""),
    };
  }).filter((img): img is ImageMeta => img !== null);

// --- Parsers ---

const parseBuilding = (row: CsvRow) => ({
  id: row.id,
  slug: row.slug || generateSlug(row.name),
  name: row.name,
  nameKo: toOptionalString(row.nameKo ?? ""),
  architectId: row.architectId,
  cityId: row.cityId,
  year: Number(row.year),
  description: row.description,
  address: row.address,
  location: { lat: Number(row.location_lat), lng: Number(row.location_lng) },
  googleMapsUrl: toOptionalString(row.googleMapsUrl ?? ""),
  images: reconstructImages(row, "image"),
  tags: parseTags(row.tags ?? ""),
  status: row.status || "draft",
  typology: toOptionalString(row.typology ?? ""),
  website: toOptionalString(row.website ?? ""),
});

const parseArchitect = (row: CsvRow) => ({
  id: row.id,
  slug: row.slug || generateSlug(row.name),
  name: row.name,
  nameKo: toOptionalString(row.nameKo ?? ""),
  nationality: row.nationality,
  birthYear: toNumber(row.birthYear ?? ""),
  deathYear: toNumber(row.deathYear ?? ""),
  bio: row.bio,
  portrait: row.portrait_src
    ? {
        src: row.portrait_src,
        alt: row.portrait_alt ?? "",
        width: toNumber(row.portrait_width ?? ""),
        height: toNumber(row.portrait_height ?? ""),
        credit: toOptionalString(row.portrait_credit ?? ""),
      }
    : undefined,
  tags: parseTags(row.tags ?? ""),
  status: row.status || "draft",
  website: toOptionalString(row.website ?? ""),
  notableWorks: parseStringArray(row.notableWorks ?? ""),
});

const parseCity = (row: CsvRow) => ({
  id: row.id,
  slug: row.slug || generateSlug(row.name),
  name: row.name,
  nameKo: toOptionalString(row.nameKo ?? ""),
  country: row.country,
  description: row.description,
  location: { lat: Number(row.location_lat), lng: Number(row.location_lng) },
  images: reconstructImages(row, "image"),
  tags: parseTags(row.tags ?? ""),
  status: row.status || "draft",
});

const parseShop = (row: CsvRow) => ({
  id: row.id,
  slug: row.slug || generateSlug(row.name),
  name: row.name,
  nameKo: toOptionalString(row.nameKo ?? ""),
  cityId: row.cityId,
  category: row.category,
  description: row.description,
  address: row.address,
  location: { lat: Number(row.location_lat), lng: Number(row.location_lng) },
  images: reconstructImages(row, "image"),
  tags: parseTags(row.tags ?? ""),
  status: row.status || "draft",
  website: toOptionalString(row.website ?? ""),
  openingHours: toOptionalString(row.openingHours ?? ""),
});

const parseEvent = (row: CsvRow) => ({
  id: row.id,
  slug: row.slug || generateSlug(row.title),
  title: row.title,
  titleKo: toOptionalString(row.titleKo ?? ""),
  cityId: row.cityId,
  description: row.description,
  date: {
    start: row.date_start,
    end: toOptionalString(row.date_end ?? ""),
  },
  venue: row.venue,
  address: toOptionalString(row.address ?? ""),
  location: row.location_lat
    ? { lat: Number(row.location_lat), lng: Number(row.location_lng) }
    : undefined,
  images: reconstructImages(row, "image"),
  tags: parseTags(row.tags ?? ""),
  status: row.status || "draft",
  website: toOptionalString(row.website ?? ""),
});

// --- Entity Config ---

const ENTITIES = [
  { name: "buildings", parser: parseBuilding },
  { name: "architects", parser: parseArchitect },
  { name: "cities", parser: parseCity },
  { name: "shops", parser: parseShop },
  { name: "events", parser: parseEvent },
] as const;

// --- Main ---

const run = () => {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf("--input");
  const outputIdx = args.indexOf("--output");

  const inputDir = inputIdx >= 0 ? args[inputIdx + 1] : "./data-csv";
  const outputDir = outputIdx >= 0 ? args[outputIdx + 1] : "./src/lib/data";

  console.log(`📂 Input: ${inputDir}`);
  console.log(`📂 Output: ${outputDir}\n`);

  let processed = 0;

  for (const { name, parser } of ENTITIES) {
    const csvPath = resolve(inputDir, `${name}.csv`);
    if (!existsSync(csvPath)) {
      console.log(`⏭  ${name}.csv 없음 — 건너뜀`);
      continue;
    }

    const content = readFileSync(csvPath, "utf-8");
    const rows = parseCsv(content);
    const data = rows.map(parser);

    const outputPath = resolve(outputDir, `${name}.json`);
    writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    console.log(`✅ ${name}: ${rows.length}개 → ${outputPath}`);
    processed++;
  }

  if (processed === 0) {
    console.log("\n⚠️  변환된 파일 없음. CSV 파일이 input 디렉토리에 있는지 확인하세요.");
  } else {
    console.log(`\n✅ ${processed}개 엔티티 변환 완료`);
  }
};

run();
