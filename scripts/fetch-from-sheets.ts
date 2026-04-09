import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Google Sheets → CSV 다운로드
 *
 * 공개 시트 + API Key 방식:
 * - 시트를 "링크가 있는 모든 사용자 보기 가능"으로 설정
 * - Google Cloud Console에서 Sheets API 활성화 + API Key 발급
 *
 * 환경 변수:
 *   GOOGLE_SHEETS_ID  — 시트 문서 ID (URL에서 추출)
 *   GOOGLE_API_KEY    — Google API Key
 */

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

const SHEET_TABS = [
  { name: "Buildings", file: "buildings.csv" },
  { name: "Architects", file: "architects.csv" },
  { name: "Cities", file: "cities.csv" },
  { name: "Shops", file: "shops.csv" },
  { name: "Events", file: "events.csv" },
] as const;

const OUTPUT_DIR = resolve(process.cwd(), "data-csv");

type SheetRow = string[];
type SheetResponse = {
  values?: SheetRow[];
  error?: { message: string };
};

const fetchSheet = async (
  sheetId: string,
  apiKey: string,
  tabName: string,
): Promise<SheetRow[]> => {
  const url = `${SHEETS_API_BASE}/${sheetId}/values/${encodeURIComponent(tabName)}?key=${apiKey}`;
  const res = await fetch(url);
  const data = (await res.json()) as SheetResponse;

  if (data.error) {
    throw new Error(`Sheet "${tabName}": ${data.error.message}`);
  }

  return data.values ?? [];
};

const rowsToCsv = (rows: SheetRow[]): string => {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const val = cell ?? "";
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(","),
    )
    .join("\n") + "\n";
};

const run = async () => {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!sheetId || !apiKey) {
    console.error("❌ 환경 변수가 필요합니다:");
    console.error("   GOOGLE_SHEETS_ID — 시트 문서 ID");
    console.error("   GOOGLE_API_KEY   — Google API Key");
    console.error("");
    console.error("💡 .env.local에 추가하세요:");
    console.error('   GOOGLE_SHEETS_ID="1abc..."');
    console.error('   GOOGLE_API_KEY="AIza..."');
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📡 Fetching from Google Sheets: ${sheetId}\n`);

  const entityArg = process.argv[2] ?? "all";
  const tabs = entityArg === "all"
    ? SHEET_TABS
    : SHEET_TABS.filter((t) => t.file.startsWith(entityArg));

  let fetched = 0;

  for (const tab of tabs) {
    try {
      const rows = await fetchSheet(sheetId, apiKey, tab.name);
      if (rows.length <= 1) {
        console.log(`⏭  ${tab.name}: empty (header only) — skipped`);
        continue;
      }

      const csv = rowsToCsv(rows);
      const outPath = resolve(OUTPUT_DIR, tab.file);
      writeFileSync(outPath, csv, "utf-8");
      console.log(`✅ ${tab.name}: ${rows.length - 1} rows → ${outPath}`);
      fetched++;
    } catch (err) {
      console.error(`❌ ${tab.name}: ${(err as Error).message}`);
    }
  }

  if (fetched === 0) {
    console.log("\n⚠️  No data fetched. Check sheet ID, API key, and tab names.");
    process.exit(1);
  }

  console.log(`\n✅ ${fetched} tabs fetched. Run next:`);
  console.log("   npx tsx scripts/csv-to-json.ts");
  console.log("   npm run validate");
};

run();
