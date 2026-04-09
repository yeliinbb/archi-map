import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

// --- Types ---

type JsonRecord = Record<string, unknown>;
const MAX_IMAGES = 5;
const DATA_DIR = resolve(process.cwd(), "src/lib/data");
const OUTPUT_DIR = resolve(process.cwd(), "data-csv");

// --- Helpers ---

const escapeCsv = (val: string): string => {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

const flattenTags = (tags: Array<{ label: string; slug: string }>): string =>
  tags.map((t) => `${t.label}:${t.slug}`).join(", ");

const flattenImages = (
  images: Array<Record<string, unknown>>,
  prefix: string,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (let i = 0; i < MAX_IMAGES; i++) {
    const img = images[i];
    const idx = i + 1;
    result[`${prefix}_${idx}_src`] = (img?.src as string) ?? "";
    result[`${prefix}_${idx}_alt`] = (img?.alt as string) ?? "";
    result[`${prefix}_${idx}_width`] = img?.width != null ? String(img.width) : "";
    result[`${prefix}_${idx}_height`] = img?.height != null ? String(img.height) : "";
    result[`${prefix}_${idx}_credit`] = (img?.credit as string) ?? "";
  }
  return result;
};

// --- Entity Flatteners ---

const flattenBuilding = (b: JsonRecord): Record<string, string> => ({
  id: String(b.id ?? ""),
  slug: String(b.slug ?? ""),
  name: String(b.name ?? ""),
  nameKo: String(b.nameKo ?? ""),
  architectId: String(b.architectId ?? ""),
  cityId: String(b.cityId ?? ""),
  year: String(b.year ?? ""),
  description: String(b.description ?? ""),
  address: String(b.address ?? ""),
  location_lat: String((b.location as Record<string, number>)?.lat ?? ""),
  location_lng: String((b.location as Record<string, number>)?.lng ?? ""),
  googleMapsUrl: String(b.googleMapsUrl ?? ""),
  tags: flattenTags((b.tags as Array<{ label: string; slug: string }>) ?? []),
  status: String(b.status ?? ""),
  typology: String(b.typology ?? ""),
  website: String(b.website ?? ""),
  ...flattenImages((b.images as Array<Record<string, unknown>>) ?? [], "image"),
});

const flattenArchitect = (a: JsonRecord): Record<string, string> => {
  const portrait = a.portrait as Record<string, unknown> | undefined;
  return {
    id: String(a.id ?? ""),
    slug: String(a.slug ?? ""),
    name: String(a.name ?? ""),
    nameKo: String(a.nameKo ?? ""),
    nationality: String(a.nationality ?? ""),
    birthYear: String(a.birthYear ?? ""),
    deathYear: String(a.deathYear ?? ""),
    bio: String(a.bio ?? ""),
    tags: flattenTags((a.tags as Array<{ label: string; slug: string }>) ?? []),
    status: String(a.status ?? ""),
    website: String(a.website ?? ""),
    notableWorks: ((a.notableWorks as string[]) ?? []).join(", "),
    portrait_src: String(portrait?.src ?? ""),
    portrait_alt: String(portrait?.alt ?? ""),
    portrait_width: portrait?.width != null ? String(portrait.width) : "",
    portrait_height: portrait?.height != null ? String(portrait.height) : "",
    portrait_credit: String(portrait?.credit ?? ""),
  };
};

const flattenCity = (c: JsonRecord): Record<string, string> => ({
  id: String(c.id ?? ""),
  slug: String(c.slug ?? ""),
  name: String(c.name ?? ""),
  nameKo: String(c.nameKo ?? ""),
  country: String(c.country ?? ""),
  description: String(c.description ?? ""),
  location_lat: String((c.location as Record<string, number>)?.lat ?? ""),
  location_lng: String((c.location as Record<string, number>)?.lng ?? ""),
  tags: flattenTags((c.tags as Array<{ label: string; slug: string }>) ?? []),
  status: String(c.status ?? ""),
  ...flattenImages((c.images as Array<Record<string, unknown>>) ?? [], "image"),
});

const flattenShop = (s: JsonRecord): Record<string, string> => ({
  id: String(s.id ?? ""),
  slug: String(s.slug ?? ""),
  name: String(s.name ?? ""),
  nameKo: String(s.nameKo ?? ""),
  cityId: String(s.cityId ?? ""),
  category: String(s.category ?? ""),
  description: String(s.description ?? ""),
  address: String(s.address ?? ""),
  location_lat: String((s.location as Record<string, number>)?.lat ?? ""),
  location_lng: String((s.location as Record<string, number>)?.lng ?? ""),
  tags: flattenTags((s.tags as Array<{ label: string; slug: string }>) ?? []),
  status: String(s.status ?? ""),
  website: String(s.website ?? ""),
  openingHours: String(s.openingHours ?? ""),
  ...flattenImages((s.images as Array<Record<string, unknown>>) ?? [], "image"),
});

const flattenEvent = (e: JsonRecord): Record<string, string> => {
  const date = e.date as Record<string, string> | undefined;
  const loc = e.location as Record<string, number> | undefined;
  return {
    id: String(e.id ?? ""),
    slug: String(e.slug ?? ""),
    title: String(e.title ?? ""),
    titleKo: String(e.titleKo ?? ""),
    cityId: String(e.cityId ?? ""),
    description: String(e.description ?? ""),
    date_start: String(date?.start ?? ""),
    date_end: String(date?.end ?? ""),
    venue: String(e.venue ?? ""),
    address: String(e.address ?? ""),
    location_lat: loc ? String(loc.lat) : "",
    location_lng: loc ? String(loc.lng) : "",
    tags: flattenTags((e.tags as Array<{ label: string; slug: string }>) ?? []),
    status: String(e.status ?? ""),
    website: String(e.website ?? ""),
    ...flattenImages((e.images as Array<Record<string, unknown>>) ?? [], "image"),
  };
};

// --- Main ---

const ENTITIES = [
  { name: "buildings", flattener: flattenBuilding },
  { name: "architects", flattener: flattenArchitect },
  { name: "cities", flattener: flattenCity },
  { name: "shops", flattener: flattenShop },
  { name: "events", flattener: flattenEvent },
] as const;

const run = () => {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📂 Output: ${OUTPUT_DIR}\n`);

  for (const { name, flattener } of ENTITIES) {
    const raw = JSON.parse(readFileSync(resolve(DATA_DIR, `${name}.json`), "utf-8")) as JsonRecord[];
    const rows = raw.map(flattener);

    if (rows.length === 0) {
      console.log(`⏭  ${name}: 0 rows — skipped`);
      continue;
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => headers.map((h) => escapeCsv(row[h] ?? "")).join(",")),
    ];

    const outPath = resolve(OUTPUT_DIR, `${name}.csv`);
    writeFileSync(outPath, csvLines.join("\n") + "\n", "utf-8");
    console.log(`✅ ${name}: ${rows.length} rows → ${outPath}`);
  }

  console.log("\n💡 CSV 파일을 Google Sheets에 Import하세요:");
  console.log("   1. Google Sheets 새 문서 생성");
  console.log("   2. File → Import → Upload → CSV 파일 선택");
  console.log("   3. 각 엔티티를 별도 탭(시트)으로 Import");
  console.log("   4. 시트를 '링크가 있는 모든 사용자 보기 가능'으로 공유");
};

run();
