# Section 4: Shops & Events Module

## Background

Archi Curation은 건축물/건축가/도시 외에도 Shop(디자인 숍, 서점 등)과 Event(건축 전시, 디자인 페어 등)를 아카이빙한다. `src/types/entities.ts`에 `Shop`과 `Event` 인터페이스가 이미 정의되어 있지만, 실제 데이터 파일이나 UI 페이지는 아직 존재하지 않는다. 이 섹션에서는 시드 데이터를 생성하고, 기존 Buildings 패턴을 따르는 리스트/상세 페이지를 구축하며, 네비게이션과 지도에 통합한다.

---

## Current State

### 타입 정의 (존재함)

**Shop** (`src/types/entities.ts`):
```ts
interface Shop {
  id: string;
  slug: string;
  name: string;
  nameKo?: string;
  cityId: string;
  category: string;
  description: string;
  address: string;
  location: GeoLocation;
  images: ImageMeta[];
  tags: Tag[];
  status: PublishStatus;
  website?: string;
  openingHours?: string;
}
```

**Event** (`src/types/entities.ts`):
```ts
interface Event {
  id: string;
  slug: string;
  title: string;
  titleKo?: string;
  cityId: string;
  description: string;
  date: DateRange;        // { start: string; end?: string }
  venue: string;
  address?: string;
  location?: GeoLocation; // optional (일부 이벤트는 위치 없음)
  images: ImageMeta[];
  tags: Tag[];
  status: PublishStatus;
  website?: string;
}
```

### 미존재 항목

- `src/lib/data/shops.json` — 없음
- `src/lib/data/events.json` — 없음
- `/map/shops` 페이지 — 없음
- `/map/events` 페이지 — 없음
- `site-header.tsx` 네비게이션에 Shops/Events 링크 — 없음
- `data.ts`에 Shop/Event 쿼리 함수 — 없음
- 지도에 Shop/Event 마커 — 없음

---

## Dependencies

| 관계 | Section | 이유 |
|------|---------|------|
| **requires** | section-01 (Image Optimization) | ShopCard, EventCard에서 OptimizedImage 사용 |
| **requires** | section-02 (Map Enhancement) | 지도에 shop/event 마커 추가, entity type 필터 |
| **blocks** | section-06 (Data Pipeline) | Shop/Event 데이터 구조가 확정되어야 스키마 매핑 가능 |

---

## Implementation Details

### Task 1: 시드 데이터 파일 생성

#### `src/lib/data/shops.json`

2-3개의 디자인/건축 관련 숍 데이터를 생성한다. 기존 cities 데이터의 `cityId`를 참조한다.

```json
[
  {
    "id": "shop-vitra-design-museum-shop",
    "slug": "vitra-design-museum-shop",
    "name": "Vitra Design Museum Shop",
    "nameKo": "비트라 디자인 뮤지엄 숍",
    "cityId": "city-basel",
    "category": "furniture",
    "description": "Curated selection of design objects, furniture miniatures, and architecture books at the Vitra Campus.",
    "address": "Charles-Eames-Str. 2, 79576 Weil am Rhein, Germany",
    "location": { "lat": 47.6208, "lng": 7.6228 },
    "images": [],
    "tags": [
      { "label": "Furniture", "slug": "furniture" },
      { "label": "Design Objects", "slug": "design-objects" }
    ],
    "status": "published",
    "website": "https://www.design-museum.de/en/shop.html",
    "openingHours": "Mon-Sun 10:00-18:00"
  }
]
```

> 실제 데이터는 구현 시 2-3개로 확장. 카테고리 예시: `furniture`, `bookstore`, `gallery-shop`.

#### `src/lib/data/events.json`

2-3개의 건축/디자인 이벤트 데이터를 생성한다.

```json
[
  {
    "id": "evt-venice-biennale-2025",
    "slug": "venice-architecture-biennale-2025",
    "title": "Venice Architecture Biennale 2025",
    "titleKo": "2025 베니스 건축 비엔날레",
    "cityId": "city-venice",
    "description": "The 19th International Architecture Exhibition at La Biennale di Venezia.",
    "date": { "start": "2025-05-10", "end": "2025-11-23" },
    "venue": "Giardini & Arsenale",
    "address": "Castello, 30122 Venice, Italy",
    "location": { "lat": 45.4299, "lng": 12.3567 },
    "images": [],
    "tags": [
      { "label": "Biennale", "slug": "biennale" },
      { "label": "Exhibition", "slug": "exhibition" }
    ],
    "status": "published",
    "website": "https://www.labiennale.org/en/architecture"
  }
]
```

> 이벤트 예시: 건축 비엔날레, 디자인 페어, 건축 전시 등.

---

### Task 2: 데이터 쿼리 함수 추가

`src/lib/data/data.ts`에 기존 Buildings/Architects/Cities 패턴을 따라 추가한다.

```ts
import type { Shop, Event } from "@/types";
import shopsData from "./shops.json";
import eventsData from "./events.json";

// --- Shops ---

export function getShops(): Shop[] {
  return (shopsData as Shop[]).filter((s) => s.status === "published");
}

export function getShopBySlug(slug: string): Shop | undefined {
  return getShops().find((s) => s.slug === slug);
}

export function getShopsByCity(cityId: string): Shop[] {
  return getShops().filter((s) => s.cityId === cityId);
}

export function getShopsByTag(tagSlug: string): Shop[] {
  return getShops().filter((s) =>
    s.tags.some((t) => t.slug === tagSlug)
  );
}

// --- Events ---

export function getEvents(): Event[] {
  return (eventsData as Event[]).filter((e) => e.status === "published");
}

export function getEventBySlug(slug: string): Event | undefined {
  return getEvents().find((e) => e.slug === slug);
}

export function getEventsByCity(cityId: string): Event[] {
  return getEvents().filter((e) => e.cityId === cityId);
}

export function getEventsByTag(tagSlug: string): Event[] {
  return getEvents().filter((e) =>
    e.tags.some((t) => t.slug === tagSlug)
  );
}

// --- All Tags (Shop + Event 포함 확장) ---

export function getAllShopTags(): Tag[] {
  const tagMap = new Map<string, Tag>();
  for (const shop of getShops()) {
    for (const tag of shop.tags) {
      if (!tagMap.has(tag.slug)) {
        tagMap.set(tag.slug, tag);
      }
    }
  }
  return [...tagMap.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function getAllEventTags(): Tag[] {
  const tagMap = new Map<string, Tag>();
  for (const event of getEvents()) {
    for (const tag of event.tags) {
      if (!tagMap.has(tag.slug)) {
        tagMap.set(tag.slug, tag);
      }
    }
  }
  return [...tagMap.values()].sort((a, b) => a.label.localeCompare(b.label));
}
```

> `src/types/index.ts`에서 `Shop`, `Event` 타입을 re-export해야 한다.

---

### Task 3: 리스트 페이지

기존 `src/app/[locale]/map/buildings/page.tsx` 패턴을 따른다.

#### `src/app/[locale]/map/shops/page.tsx`

- `getShops()`, `getAllShopTags()`로 데이터 로드
- `StaggerContainer` + `StaggerItem`으로 그리드 애니메이션
- 태그 필터 바 (TagBadge 링크)
- `ShopCard` 컴포넌트로 각 항목 렌더링
- `setRequestLocale(locale)` 호출
- 메타데이터: `title: t("nav.shops")`

```tsx
// 핵심 구조
export default async function ShopsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const shops = getShops();
  const allTags = getAllShopTags();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* header: label + title + count */}
      {/* tag filter bar */}
      <StaggerContainer className="grid gap-px border border-border sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <StaggerItem key={shop.id}>
            <ShopCard shop={shop} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
```

#### `src/app/[locale]/map/events/page.tsx`

- 동일 패턴, `getEvents()` + `getAllEventTags()` 사용
- `EventCard` 컴포넌트로 각 항목 렌더링
- 이벤트 날짜 범위 표시 (DateRange 포맷팅)

---

### Task 4: 상세 페이지

#### `src/app/[locale]/map/shops/[slug]/page.tsx`

- `getShopBySlug(slug)`로 데이터 로드
- `notFound()` 처리 (slug 불일치 시)
- `generateStaticParams`: `getShops().map((s) => ({ slug: s.slug }))`
- 상세 정보: 이름(nameKo 병기), 카테고리, 설명, 주소, 영업시간, 웹사이트 링크
- 이미지 갤러리 (OptimizedImage 사용)
- 태그 표시
- 도시 링크 (`getCityById(shop.cityId)`)
- 지도 위치 미니맵 (optional, section-02 완료 후)

```tsx
export async function generateStaticParams() {
  return getShops().map((shop) => ({ slug: shop.slug }));
}

export default async function ShopDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const shop = getShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  const t = await getTranslations();
  const city = getCityById(shop.cityId);
  // ... render detail layout
}
```

#### `src/app/[locale]/map/events/[slug]/page.tsx`

- 동일 패턴, `getEventBySlug(slug)` 사용
- 추가 필드: `date` (DateRange 포맷팅), `venue`
- `generateStaticParams`: `getEvents().map((e) => ({ slug: e.slug }))`

---

### Task 5: 카드 컴포넌트

#### `src/components/features/shops/shop-card.tsx`

```tsx
interface ShopCardProps {
  shop: Shop;
}

function ShopCard({ shop }: ShopCardProps) {
  const t = useTranslations();
  const city = getCityById(shop.cityId);

  return (
    <Link
      href={`/map/shops/${shop.slug}`}
      className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
    >
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <TagBadge variant="outline">{shop.category}</TagBadge>
        </div>
        <h2 className="mb-1 font-mono text-base tracking-wide">
          {shop.name}
        </h2>
        <p className="mb-3 font-mono text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {shop.description}
        </p>
      </div>
      <div className="flex items-center justify-between font-mono text-micro text-muted-foreground">
        <span>{city?.name}</span>
        <span className="transition-colors group-hover:text-foreground">
          →
        </span>
      </div>
    </Link>
  );
}
```

> `function` 선언식 사용. Props는 `interface`로 정의. 조건부 렌더링 시 삼항 연산자 사용.

#### `src/components/features/events/event-card.tsx`

- 동일 패턴
- `title` 필드 사용 (Shop의 `name`과 다름)
- 날짜 범위 표시: `formatDateRange(event.date)` 유틸리티 필요
- `venue` 표시

```tsx
interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const city = getCityById(event.cityId);

  return (
    <Link
      href={`/map/events/${event.slug}`}
      className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
    >
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-mono text-micro text-muted-foreground">
            {formatDateRange(event.date)}
          </span>
        </div>
        <h2 className="mb-1 font-mono text-base tracking-wide">
          {event.title}
        </h2>
        <p className="mb-3 font-mono text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {event.description}
        </p>
      </div>
      <div className="flex items-center justify-between font-mono text-micro text-muted-foreground">
        <span>{event.venue} · {city?.name}</span>
        <span className="transition-colors group-hover:text-foreground">
          →
        </span>
      </div>
    </Link>
  );
}
```

**날짜 포맷팅 유틸리티** (`src/lib/utils/format-date.ts`):

```ts
const formatDateRange = (date: DateRange): string => {
  const start = new Date(date.start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!date.end) return start;
  const end = new Date(date.end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${start} — ${end}`;
};
```

> 화살표 함수 (유틸리티). 추후 locale-aware 포맷팅으로 확장 가능.

---

### Task 6: 네비게이션 업데이트

`src/components/layouts/site-header.tsx`의 `navigation` 배열에 Shops/Events 추가:

```ts
const navigation = [
  { name: t("nav.map"), href: "/map" },
  { name: t("nav.buildings"), href: "/map/buildings" },
  { name: t("nav.architects"), href: "/map/architects" },
  { name: t("nav.cities"), href: "/map/cities" },
  { name: t("nav.shops"), href: "/map/shops" },       // 추가
  { name: t("nav.events"), href: "/map/events" },      // 추가
  { name: t("nav.diagram"), href: "/diagram" },
  { name: t("nav.about"), href: "/about" },
];
```

> 데스크톱/모바일 동일 배열을 사용하므로 한 곳만 수정하면 양쪽 반영됨.

---

### Task 7: 지도 통합

Section 2 (Map Enhancement) 완료 후 진행한다.

#### 마커 추가

- `map-view.tsx`의 GeoJSON source에 shop/event 데이터를 별도 source로 추가
- Shop 마커: 건물 마커와 구분되는 색상 (예: OKLCh accent 계열)
- Event 마커: 별도 아이콘/색상 (예: 원형 + 별표)
- `location`이 optional인 Event는 마커 미표시

#### Entity Type 필터

- `map-filter.tsx`에 entity type 셀렉터 추가
- 기본값: Buildings만 표시
- 토글 버튼: Buildings / Shops / Events (복수 선택 가능)
- 필터 상태: URL search params에 `types=building,shop,event` 형태로 반영

```ts
// GeoJSON source 구성 예시
const shopFeatures: Feature[] = getShops()
  .filter((s) => s.location)
  .map((s) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [s.location.lng, s.location.lat] },
    properties: { id: s.id, name: s.name, type: "shop", category: s.category },
  }));
```

---

### Task 8: i18n 문자열 추가

#### `messages/en.json` 추가 키

```json
{
  "nav.shops": "Shops",
  "nav.events": "Events",
  "shops.label": "Archive",
  "shops.title": "Shops",
  "shops.entries": "{count} shops",
  "shops.category": "Category",
  "shops.openingHours": "Opening Hours",
  "shops.website": "Website",
  "shops.address": "Address",
  "shops.empty": "No shops found",
  "events.label": "Archive",
  "events.title": "Events",
  "events.entries": "{count} events",
  "events.venue": "Venue",
  "events.date": "Date",
  "events.website": "Website",
  "events.empty": "No events found",
  "events.upcoming": "Upcoming",
  "events.past": "Past",
  "map.filter.entityType": "Type",
  "map.filter.buildings": "Buildings",
  "map.filter.shops": "Shops",
  "map.filter.events": "Events"
}
```

#### `messages/ko.json` 추가 키

```json
{
  "nav.shops": "숍",
  "nav.events": "이벤트",
  "shops.label": "아카이브",
  "shops.title": "숍",
  "shops.entries": "{count}개의 숍",
  "shops.category": "카테고리",
  "shops.openingHours": "영업시간",
  "shops.website": "웹사이트",
  "shops.address": "주소",
  "shops.empty": "숍이 없습니다",
  "events.label": "아카이브",
  "events.title": "이벤트",
  "events.entries": "{count}개의 이벤트",
  "events.venue": "장소",
  "events.date": "날짜",
  "events.website": "웹사이트",
  "events.empty": "이벤트가 없습니다",
  "events.upcoming": "예정",
  "events.past": "지난 이벤트",
  "map.filter.entityType": "유형",
  "map.filter.buildings": "건축물",
  "map.filter.shops": "숍",
  "map.filter.events": "이벤트"
}
```

---

## Acceptance Criteria

- [ ] `shops.json`에 2-3개의 시드 데이터 존재
- [ ] `events.json`에 2-3개의 시드 데이터 존재
- [ ] `data.ts`에 getShops, getShopBySlug, getShopsByCity, getShopsByTag 함수 존재
- [ ] `data.ts`에 getEvents, getEventBySlug, getEventsByCity, getEventsByTag 함수 존재
- [ ] `/map/shops` 리스트 페이지에서 ShopCard 그리드 렌더링
- [ ] `/map/events` 리스트 페이지에서 EventCard 그리드 렌더링
- [ ] `/map/shops/[slug]` 상세 페이지 동작 (notFound 처리 포함)
- [ ] `/map/events/[slug]` 상세 페이지 동작 (notFound 처리 포함)
- [ ] `generateStaticParams`로 정적 생성 (shops + events)
- [ ] SiteHeader 데스크톱 네비게이션에 Shops/Events 링크 표시
- [ ] SiteHeader 모바일 메뉴에 Shops/Events 링크 표시
- [ ] 지도에 shop 마커 표시 (building 마커와 시각적 구분)
- [ ] 지도에 event 마커 표시 (location이 있는 이벤트만)
- [ ] 지도 필터에서 entity type(Buildings/Shops/Events) 선택 가능
- [ ] `messages/en.json`에 모든 shops/events 관련 키 추가
- [ ] `messages/ko.json`에 모든 shops/events 관련 키 추가
- [ ] 하드코딩 문자열 없음 (모든 UI 텍스트는 i18n 키 사용)
- [ ] `npm run build` 성공
- [ ] 모바일 반응형 (sm/md/lg breakpoint 정상)

---

## Files to Create

| File | Description |
|------|-------------|
| `src/lib/data/shops.json` | Shop 시드 데이터 (2-3개) |
| `src/lib/data/events.json` | Event 시드 데이터 (2-3개) |
| `src/app/[locale]/map/shops/page.tsx` | Shops 리스트 페이지 |
| `src/app/[locale]/map/shops/[slug]/page.tsx` | Shop 상세 페이지 |
| `src/app/[locale]/map/events/page.tsx` | Events 리스트 페이지 |
| `src/app/[locale]/map/events/[slug]/page.tsx` | Event 상세 페이지 |
| `src/components/features/shops/shop-card.tsx` | ShopCard 컴포넌트 |
| `src/components/features/events/event-card.tsx` | EventCard 컴포넌트 |
| `src/lib/utils/format-date.ts` | DateRange 포맷팅 유틸리티 |

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/data/data.ts` | Shop/Event 쿼리 함수 8개 + 태그 함수 2개 추가 |
| `src/types/index.ts` | `Shop`, `Event` 타입 re-export 확인 |
| `src/components/layouts/site-header.tsx` | navigation 배열에 shops/events 링크 추가 |
| `src/components/features/map/map-view.tsx` | Shop/Event GeoJSON source + 마커 레이어 추가 |
| `src/components/features/map/map-filter.tsx` | Entity type 셀렉터 추가 |
| `messages/en.json` | shops/events 관련 i18n 키 추가 |
| `messages/ko.json` | shops/events 관련 i18n 키 추가 |

---

## Conventions Checklist

- [x] 컴포넌트는 `function` 선언식 (`function ShopCard() {}`)
- [x] 유틸리티는 화살표 함수 (`const formatDateRange = () => {}`)
- [x] Props는 `interface`로 정의 (`interface ShopCardProps`)
- [x] 조건부 렌더링: 삼항 연산자 사용, `&&` 금지
- [x] 파일명: kebab-case (`shop-card.tsx`, `format-date.ts`)
- [x] 컴포넌트명: PascalCase (`ShopCard`, `EventCard`)
- [x] i18n: 모든 UI 문자열은 번역 키 사용
- [x] Tailwind: 테마 토큰 사용, 하드코딩 색상값 금지
- [x] Zustand 셀렉터: 필요한 값만 구독
- [x] 컴포넌트 파일 300줄 이내
