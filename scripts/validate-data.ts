import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// --- Types ---

type ValidationError = {
  entity: string;
  id: string;
  field: string;
  message: string;
};

type EntityRecord = Record<string, unknown> & {
  id: string;
  slug: string;
  status: string;
};

// --- Data Loading ---

const DATA_DIR = resolve(process.cwd(), "src/lib/data");

const loadJson = <T>(filename: string): T[] => {
  const path = resolve(DATA_DIR, filename);
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as T[];
};

const loadAllData = () => ({
  buildings: loadJson<EntityRecord>("buildings.json"),
  architects: loadJson<EntityRecord>("architects.json"),
  cities: loadJson<EntityRecord>("cities.json"),
  shops: loadJson<EntityRecord>("shops.json"),
  events: loadJson<EntityRecord>("events.json"),
});

type AllData = ReturnType<typeof loadAllData>;

// --- Validators ---

const VALID_STATUSES = ["draft", "published", "archived"];
const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CURRENT_YEAR = new Date().getFullYear();

const validateSlugUniqueness = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  for (const [entity, records] of Object.entries(data)) {
    const slugs = new Map<string, string>();
    for (const r of records) {
      const existing = slugs.get(r.slug);
      if (existing) {
        errors.push({
          entity,
          id: r.id,
          field: "slug",
          message: `slug "${r.slug}" 중복 (기존: ${existing})`,
        });
      } else {
        slugs.set(r.slug, r.id);
      }
    }
  }
  return errors;
};

const validateIdUniqueness = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  for (const [entity, records] of Object.entries(data)) {
    const ids = new Set<string>();
    for (const r of records) {
      if (ids.has(r.id)) {
        errors.push({ entity, id: r.id, field: "id", message: `id "${r.id}" 중복` });
      }
      ids.add(r.id);
    }
  }
  return errors;
};

const validateCoordinateRanges = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const check = (entity: string, records: EntityRecord[]) => {
    for (const r of records) {
      const loc = r.location as { lat?: number; lng?: number } | undefined;
      if (!loc) continue;
      if (loc.lat !== undefined && (loc.lat < -90 || loc.lat > 90)) {
        errors.push({ entity, id: r.id, field: "location.lat", message: `lat ${loc.lat} 범위 초과 (-90~90)` });
      }
      if (loc.lng !== undefined && (loc.lng < -180 || loc.lng > 180)) {
        errors.push({ entity, id: r.id, field: "location.lng", message: `lng ${loc.lng} 범위 초과 (-180~180)` });
      }
    }
  };
  check("buildings", data.buildings);
  check("cities", data.cities);
  check("shops", data.shops);
  check("events", data.events);
  return errors;
};

const validateRequiredFields = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  for (const [entity, records] of Object.entries(data)) {
    for (const r of records) {
      if (!r.id) errors.push({ entity, id: r.id || "?", field: "id", message: "필수 필드 누락" });
      if (!r.slug) errors.push({ entity, id: r.id, field: "slug", message: "필수 필드 누락" });
      if (!r.status) errors.push({ entity, id: r.id, field: "status", message: "필수 필드 누락" });
    }
  }
  return errors;
};

const validateStatusValues = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  for (const [entity, records] of Object.entries(data)) {
    for (const r of records) {
      if (!VALID_STATUSES.includes(r.status)) {
        errors.push({ entity, id: r.id, field: "status", message: `유효하지 않은 status: "${r.status}"` });
      }
    }
  }
  return errors;
};

const validateArchitectReferences = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const architectIds = new Set(data.architects.map((a) => a.id));
  for (const b of data.buildings) {
    const archId = b.architectId as string | undefined;
    if (archId && !architectIds.has(archId)) {
      errors.push({ entity: "buildings", id: b.id, field: "architectId", message: `architectId "${archId}" 미존재` });
    }
  }
  return errors;
};

const validateCityReferences = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const cityIds = new Set(data.cities.map((c) => c.id));
  const check = (entity: string, records: EntityRecord[]) => {
    for (const r of records) {
      const cId = r.cityId as string | undefined;
      if (cId && !cityIds.has(cId)) {
        errors.push({ entity, id: r.id, field: "cityId", message: `cityId "${cId}" 미존재` });
      }
    }
  };
  check("buildings", data.buildings);
  check("shops", data.shops);
  check("events", data.events);
  return errors;
};

const validateYearRange = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  for (const b of data.buildings) {
    const year = b.year as number | undefined;
    if (year !== undefined && (year < 1000 || year > CURRENT_YEAR + 10)) {
      errors.push({ entity: "buildings", id: b.id, field: "year", message: `year ${year} 범위 초과 (1000~${CURRENT_YEAR + 10})` });
    }
  }
  return errors;
};

const validateTagSlugs = (data: AllData): ValidationError[] => {
  const errors: ValidationError[] = [];
  for (const [entity, records] of Object.entries(data)) {
    for (const r of records) {
      const tags = r.tags as Array<{ slug: string }> | undefined;
      if (!tags) continue;
      for (const tag of tags) {
        if (!KEBAB_CASE_RE.test(tag.slug)) {
          errors.push({ entity, id: r.id, field: "tags", message: `tag slug "${tag.slug}" 형식 오류 (kebab-case)` });
        }
      }
    }
  }
  return errors;
};

// --- Main ---

const validators = [
  validateSlugUniqueness,
  validateIdUniqueness,
  validateCoordinateRanges,
  validateRequiredFields,
  validateStatusValues,
  validateArchitectReferences,
  validateCityReferences,
  validateYearRange,
  validateTagSlugs,
];

const run = () => {
  console.log("🔍 데이터 검증 시작...\n");

  const data = loadAllData();
  const errors: ValidationError[] = [];

  for (const validate of validators) {
    errors.push(...validate(data));
  }

  // Summary
  const counts = {
    buildings: data.buildings.length,
    architects: data.architects.length,
    cities: data.cities.length,
    shops: data.shops.length,
    events: data.events.length,
  };

  console.log("📊 데이터 현황:");
  for (const [entity, count] of Object.entries(counts)) {
    console.log(`   ${entity}: ${count}개`);
  }
  console.log();

  if (errors.length === 0) {
    console.log("✅ 모든 검증 통과!");
    process.exit(0);
  } else {
    console.log(`❌ ${errors.length}개 에러 발견:\n`);
    for (const err of errors) {
      console.log(`  [${err.entity}] ${err.id} → ${err.field}: ${err.message}`);
    }
    process.exit(1);
  }
};

run();
