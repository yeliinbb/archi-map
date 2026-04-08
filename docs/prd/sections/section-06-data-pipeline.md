# Section 6: Data Pipeline Preparation

**Priority**: Low (인프라)
**Status**: Not started
**Dependencies**: section-04-shops-events (Shops/Events 데이터 구조 확정 후)
**Blocks**: 없음

---

## Background

현재 모든 데이터는 `src/lib/data/` 디렉토리의 정적 JSON 파일로 관리된다. 큐레이터가 직접 JSON을 편집하는 방식으로 운영 중이며, 이는 개발 환경에서만 수정이 가능하다는 한계가 있다.

장기적으로 Google Sheets를 데이터 소스로 전환할 계획이 있다. Google Sheets는 모바일/태블릿을 포함한 다양한 디바이스에서 접근 가능하고, 비개발자도 데이터를 편집할 수 있으며, 변경 이력이 자동으로 관리된다.

이 섹션은 **실제 마이그레이션을 수행하지 않는다.** 현재 JSON 기반 운영을 유지하면서, 향후 Google Sheets 전환 시 필요한 도구와 문서를 미리 준비하는 것이 목표다.

---

## Current State

### 데이터 파일

| 파일 | 상태 | 비고 |
|------|------|------|
| `src/lib/data/buildings.json` | 존재 | ~4개 건축물 |
| `src/lib/data/architects.json` | 존재 | ~4명 건축가 |
| `src/lib/data/cities.json` | 존재 | ~2-3개 도시 |
| `src/lib/data/shops.json` | section-04에서 생성 예정 | 2-3개 시드 |
| `src/lib/data/events.json` | section-04에서 생성 예정 | 2-3개 시드 |

### 타입 정의

- `src/types/entities.ts` — Building, Architect, City, Shop, Event 인터페이스
- `src/types/common.ts` — ImageMeta, GeoLocation, DateRange, Tag, PublishStatus 공통 타입

### 현재 없는 것

- 데이터 유효성 검증 스크립트
- CSV/TSV 변환 도구
- 스키마 매핑 문서
- CI/CD 데이터 파이프라인

---

## Implementation Details

### 1. 스키마 매핑 문서 (`docs/data-pipeline.md`)

JSON 구조와 Google Sheets 탭/열 간의 매핑을 정의하는 참조 문서를 작성한다.

#### 1.1 Sheets 탭 구조

각 엔티티 타입이 하나의 탭(시트)에 대응한다:

| 탭 이름 | 엔티티 | 비고 |
|---------|--------|------|
| Buildings | Building | 메인 데이터 |
| Architects | Architect | 메인 데이터 |
| Cities | City | 메인 데이터 |
| Shops | Shop | section-04 이후 |
| Events | Event | section-04 이후 |

#### 1.2 필드 매핑 규칙

JSON의 중첩 구조를 스프레드시트의 평면 열로 변환하는 규칙:

**단순 필드** — 그대로 열에 매핑:
```
id, slug, name, nameKo, year, description, address, status, website, ...
```

**GeoLocation (중첩 객체)** — 접두사로 평탄화:
```json
{ "location": { "lat": 35.6762, "lng": 139.6503 } }
```
→ 열: `location_lat`, `location_lng`

**ImageMeta[] (중첩 배열)** — 인덱스 접미사로 평탄화:
```json
{ "images": [{ "src": "/img/a.jpg", "alt": "...", "width": 800, "height": 600, "credit": "..." }] }
```
→ 열: `image_1_src`, `image_1_alt`, `image_1_width`, `image_1_height`, `image_1_credit`, `image_2_src`, ...
- 최대 이미지 수를 5개로 제한 (image_1 ~ image_5)
- portrait (Architect)는 단일 이미지: `portrait_src`, `portrait_alt`, `portrait_width`, `portrait_height`, `portrait_credit`

**Tag[] (객체 배열)** — 쉼표 구분 문자열:
```json
{ "tags": [{ "label": "Brutalism", "slug": "brutalism" }, { "label": "Concrete", "slug": "concrete" }] }
```
→ 열: `tags` = `"Brutalism:brutalism, Concrete:concrete"` (label:slug 쌍, 쉼표 구분)

**DateRange (Event)** — 접두사로 평탄화:
```json
{ "date": { "start": "2025-03-01", "end": "2025-06-30" } }
```
→ 열: `date_start`, `date_end`

**string[] (notableWorks)** — 쉼표 구분:
```json
{ "notableWorks": ["Chapel of Light", "Row House"] }
```
→ 열: `notableWorks` = `"Chapel of Light, Row House"`

#### 1.3 각 엔티티별 열 목록

**Buildings 탭:**
`id`, `slug`, `name`, `nameKo`, `architectId`, `cityId`, `year`, `description`, `address`, `location_lat`, `location_lng`, `googleMapsUrl`, `tags`, `status`, `typology`, `website`, `image_1_src`, `image_1_alt`, `image_1_width`, `image_1_height`, `image_1_credit`, ... `image_5_*`

**Architects 탭:**
`id`, `slug`, `name`, `nameKo`, `nationality`, `birthYear`, `deathYear`, `bio`, `tags`, `status`, `website`, `notableWorks`, `portrait_src`, `portrait_alt`, `portrait_width`, `portrait_height`, `portrait_credit`

**Cities 탭:**
`id`, `slug`, `name`, `nameKo`, `country`, `description`, `location_lat`, `location_lng`, `tags`, `status`, `image_1_src`, ... `image_5_*`

**Shops 탭:**
`id`, `slug`, `name`, `nameKo`, `cityId`, `category`, `description`, `address`, `location_lat`, `location_lng`, `tags`, `status`, `website`, `openingHours`, `image_1_src`, ... `image_5_*`

**Events 탭:**
`id`, `slug`, `title`, `titleKo`, `cityId`, `description`, `date_start`, `date_end`, `venue`, `address`, `location_lat`, `location_lng`, `tags`, `status`, `website`, `image_1_src`, ... `image_5_*`

---

### 2. CSV → JSON 변환 스크립트 (`scripts/csv-to-json.ts`)

CSV 파일을 읽어 현재 JSON 데이터 구조로 변환하는 스크립트를 구현한다.

#### 2.1 실행 방법

```bash
npx tsx scripts/csv-to-json.ts --input ./data-csv/ --output ./src/lib/data/
```

- `--input`: CSV 파일이 있는 디렉토리 (buildings.csv, architects.csv, cities.csv, shops.csv, events.csv)
- `--output`: JSON 출력 디렉토리

#### 2.2 핵심 기능

유틸리티 함수는 화살표 함수로 구현한다 (코딩 컨벤션 준수).

```typescript
// 엔티티 타입별 CSV 파일 매핑
const ENTITY_FILES = ["buildings", "architects", "cities", "shops", "events"] as const;

// CSV 행 → JSON 객체 변환 (엔티티 타입별 파서)
const parseBuilding = (row: CsvRow): Building => { ... };
const parseArchitect = (row: CsvRow): Architect => { ... };
const parseCity = (row: CsvRow): City => { ... };
const parseShop = (row: CsvRow): Shop => { ... };
const parseEvent = (row: CsvRow): Event => { ... };
```

#### 2.3 타입 변환 규칙

| CSV 값 | JSON 타입 | 변환 로직 |
|---------|----------|-----------|
| `"35.6762"` | `number` | `Number(value)` — NaN 시 에러 |
| `"2024"` | `number` | `Number(value)` — year, birthYear, deathYear |
| `""` (빈 문자열) | `undefined` | optional 필드는 undefined 처리 |
| `"Brutalism:brutalism, Concrete:concrete"` | `Tag[]` | 쉼표로 분리 → 콜론으로 label/slug 분리 |
| `"Chapel of Light, Row House"` | `string[]` | 쉼표로 분리 → trim |
| `"/img/a.jpg"` | `ImageMeta` | image_N_* 열들을 객체로 재조립 |
| `"35.6762"` + `"139.6503"` | `GeoLocation` | location_lat + location_lng를 객체로 결합 |
| `"2025-03-01"` + `"2025-06-30"` | `DateRange` | date_start + date_end를 객체로 결합 |

#### 2.4 Slug 자동 생성

slug 열이 비어 있을 경우 name(또는 Event의 경우 title) 필드에서 자동 생성한다:

```typescript
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
```

#### 2.5 이미지 메타데이터 재구성

CSV의 평탄화된 이미지 열들을 ImageMeta 배열로 복원한다:

```typescript
const reconstructImages = (row: CsvRow, prefix: string, maxCount: number): ImageMeta[] =>
  Array.from({ length: maxCount }, (_, i) => {
    const idx = i + 1;
    const src = row[`${prefix}_${idx}_src`];
    if (!src) return null;
    return {
      src,
      alt: row[`${prefix}_${idx}_alt`] ?? "",
      width: row[`${prefix}_${idx}_width`] ? Number(row[`${prefix}_${idx}_width`]) : undefined,
      height: row[`${prefix}_${idx}_height`] ? Number(row[`${prefix}_${idx}_height`]) : undefined,
      credit: row[`${prefix}_${idx}_credit`] || undefined,
    };
  }).filter((img): img is ImageMeta => img !== null);
```

#### 2.6 의존성

- CSV 파싱: Node.js 내장 기능 또는 가벼운 라이브러리 (예: `papaparse`)
- 파일 I/O: `node:fs/promises`
- CLI 인자 파싱: `node:util` parseArgs 또는 간단한 수동 파싱

---

### 3. 데이터 검증 유틸리티 (`scripts/validate-data.ts`)

모든 JSON 데이터 파일의 무결성을 검사하는 스크립트를 구현한다.

#### 3.1 실행 방법

```bash
npm run validate
```

#### 3.2 검증 항목

| 검증 | 대상 | 설명 |
|------|------|------|
| **slug 고유성** | 모든 엔티티 | 동일 타입 내 slug 중복 없음 |
| **id 고유성** | 모든 엔티티 | 동일 타입 내 id 중복 없음 |
| **좌표 범위** | Building, City, Shop, Event (location 있는 경우) | lat: -90 ~ 90, lng: -180 ~ 180 |
| **필수 필드** | 모든 엔티티 | id, slug, status 등 필수 필드 존재 및 비어 있지 않음 |
| **status 유효값** | 모든 엔티티 | `"draft"`, `"published"`, `"archived"` 중 하나 |
| **참조 무결성 (architectId)** | Building | architectId가 architects.json에 존재 |
| **참조 무결성 (cityId)** | Building, Shop, Event | cityId가 cities.json에 존재 |
| **year 합리성** | Building | 1000 <= year <= 현재 연도 + 10 |
| **이미지 src 비어 있지 않음** | 모든 엔티티 (images 있는 경우) | images 배열 내 src 필드가 비어 있지 않음 |
| **태그 slug 형식** | 모든 엔티티 | tag.slug이 kebab-case 형식 |

#### 3.3 에러 리포트 출력

```typescript
interface ValidationError {
  entity: string;       // "buildings", "architects", ...
  id: string;           // 해당 엔티티의 id
  field: string;        // 문제가 된 필드명
  message: string;      // 에러 설명
}
```

출력 형식:
- **콘솔**: 색상 표시 포함, 요약 통계 (총 엔티티 수, 에러 수, 경고 수)
- **JSON (선택)**: `--json` 플래그 시 `validation-report.json` 파일로 출력

#### 3.4 종료 코드

| 코드 | 의미 |
|------|------|
| `0` | 모든 검증 통과 |
| `1` | 하나 이상의 에러 발견 (CI에서 빌드 실패 처리) |

#### 3.5 구현 구조

```typescript
// 검증 규칙을 함수 배열로 구성
const validators: ValidatorFn[] = [
  validateSlugUniqueness,
  validateIdUniqueness,
  validateCoordinateRanges,
  validateRequiredFields,
  validateStatusValues,
  validateArchitectReferences,
  validateCityReferences,
  validateYearRange,
  validateImageSources,
  validateTagSlugs,
];

// 메인 실행
const runValidation = async (): Promise<void> => {
  const data = await loadAllData();
  const errors: ValidationError[] = [];

  for (const validate of validators) {
    errors.push(...validate(data));
  }

  printReport(errors);
  process.exit(errors.length > 0 ? 1 : 0);
};
```

---

### 4. npm 스크립트 추가 (`package.json`)

```json
{
  "scripts": {
    "validate": "tsx scripts/validate-data.ts"
  }
}
```

`tsx`는 TypeScript 파일을 직접 실행하기 위해 사용한다. 이미 프로젝트에서 개발 의존성으로 사용 중이거나, 없으면 devDependency로 추가한다.

---

### 5. GitHub Actions 워크플로우 템플릿 (`.github/workflows/sync-data.yml`)

실제 Google Sheets API 연동은 구성하지 않으며, 향후 활성화할 수 있는 템플릿만 작성한다.

#### 5.1 워크플로우 구조

```yaml
name: Sync Data from Google Sheets

on:
  workflow_dispatch:
    inputs:
      entity:
        description: "동기화할 엔티티 (all, buildings, architects, cities, shops, events)"
        required: true
        default: "all"
        type: choice
        options:
          - all
          - buildings
          - architects
          - cities
          - shops
          - events

jobs:
  sync:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Download CSV from Google Sheets
        env:
          GOOGLE_SHEETS_ID: ${{ secrets.GOOGLE_SHEETS_ID }}
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
        run: |
          # TODO: Google Sheets API를 사용하여 CSV 다운로드
          # 각 탭을 개별 CSV 파일로 내보내기
          # 출력: ./data-csv/buildings.csv, architects.csv, ...
          echo "Google Sheets API 연동 미구현 — 템플릿"

      - name: Convert CSV to JSON
        run: npx tsx scripts/csv-to-json.ts --input ./data-csv/ --output ./src/lib/data/

      - name: Validate data
        run: npm run validate

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          commit-message: "chore: sync data from Google Sheets"
          title: "chore: Google Sheets 데이터 동기화"
          body: |
            Google Sheets에서 데이터를 동기화했습니다.
            - 엔티티: ${{ github.event.inputs.entity }}
            - 자동 검증 통과 확인
          branch: data-sync/${{ github.run_id }}
          base: master
```

#### 5.2 필요한 GitHub Secrets (미구성, 문서 참고용)

| Secret 이름 | 설명 |
|-------------|------|
| `GOOGLE_SHEETS_ID` | Google Sheets 문서 ID |
| `GOOGLE_API_KEY` | Google Sheets API 키 (읽기 전용) |

---

## Acceptance Criteria

- [ ] `docs/data-pipeline.md` 스키마 매핑 문서 작성 완료 — 5개 엔티티 모두 포함
- [ ] `scripts/csv-to-json.ts` 구현 완료 — CSV 파일을 읽어 현재 JSON 구조로 변환
- [ ] CSV → JSON 변환 시 이미지 메타데이터 재구성 동작
- [ ] CSV → JSON 변환 시 태그 배열 파싱 동작
- [ ] slug 열이 비어 있을 때 name에서 자동 생성
- [ ] `scripts/validate-data.ts` 구현 완료 — 전체 데이터 무결성 검사
- [ ] slug 고유성 검증 동작
- [ ] 좌표 범위 검증 동작 (lat: -90~90, lng: -180~180)
- [ ] 필수 필드 존재 검증 동작
- [ ] status 유효값 검증 동작 (`draft` | `published` | `archived`)
- [ ] architectId / cityId 참조 무결성 검증 동작
- [ ] 검증 실패 시 exit code 1 반환 (CI 호환)
- [ ] `npm run validate` 명령어 실행 가능 (package.json에 스크립트 추가)
- [ ] `.github/workflows/sync-data.yml` 워크플로우 템플릿 존재
- [ ] 워크플로우가 workflow_dispatch (수동 트리거)로 설정
- [ ] `npm run build` 성공 (기존 기능 영향 없음)

---

## Files to Create / Modify

### 신규 생성

| 파일 | 설명 |
|------|------|
| `docs/data-pipeline.md` | JSON ↔ Google Sheets 스키마 매핑 문서 |
| `scripts/csv-to-json.ts` | CSV → JSON 변환 스크립트 |
| `scripts/validate-data.ts` | 데이터 검증 유틸리티 |
| `.github/workflows/sync-data.yml` | GitHub Actions 워크플로우 템플릿 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `package.json` | `"validate"` 스크립트 추가 |

---

## Conventions

- **유틸리티 함수**: 화살표 함수로 작성 (`const parseTags = (raw: string): Tag[] => ...`)
- **컴포넌트**: 이 섹션에는 UI 컴포넌트 없음
- **TypeScript strict mode**: 모든 스크립트에서 strict 타입 체크 준수
- **Props 정의**: `interface` 사용 (해당 시)
- **일반 타입**: `type` 사용 (`type CsvRow = Record<string, string>`)
- **파일 네이밍**: kebab-case (`csv-to-json.ts`, `validate-data.ts`)
- **상수 네이밍**: UPPER_SNAKE_CASE (`const MAX_IMAGES = 5`)
- **에러 처리**: 스크립트는 명확한 에러 메시지와 함께 실패해야 함
- **의존성 최소화**: 가능하면 Node.js 내장 모듈 사용, 외부 의존성은 CSV 파서 정도만 허용
