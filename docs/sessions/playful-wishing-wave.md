# Archi Curation - 기술 구현 계획

## Context

Archi Curation은 큐레이터 주도의 건축/디자인 아카이브 웹사이트. MVP는 **Archi Curation · Map** — 건축물과 건축가를 지도 기반으로 탐색하고, 선택한 포인트를 추상 다이어그램으로 변환하여 이미지로 내보내는 것이 핵심.

프론트엔드만 직접 구현하며, 백엔드/배포는 **Vercel + Supabase** 사용.

---

## 1. 기술 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| **프레임워크** | Next.js App Router + TypeScript | SEO(SSR/ISR), 서버 컴포넌트 |
| **스타일링** | Tailwind CSS + shadcn/ui | 빠른 개발, 커스터마이징 자유도 |
| **지도** | MapLibre GL JS + react-map-gl | 오픈소스, 무료, Mapbox 호환 |
| **다이어그램** | SVG 렌더링 + html-to-image (export) | 건축적 라인/그리드 표현에 최적 |
| **3D/모션** | Framer Motion + SVG (MVP) → Three.js/R3F (후순위) | MVP에서 무거운 3D 불필요 |
| **데이터** | Supabase (PostgreSQL + PostGIS + Storage) | 무료 티어 충분, 위치 기반 검색 |
| **데이터 입력** | Google Sheets → 동기화 스크립트 → Supabase | 큐레이터 1인 운영에 최적 |
| **배포** | Vercel | Next.js 최적 호스팅 |

---

## 2. 프로젝트 구조

```
archi-curation/
├── src/
│   ├── app/                    # App Router
│   │   ├── page.tsx            # 홈 (SSG)
│   │   ├── about/page.tsx      # 소개 (SSG)
│   │   ├── map/
│   │   │   ├── page.tsx        # 지도 메인 (SSR + CSR)
│   │   │   ├── buildings/
│   │   │   │   ├── page.tsx    # 건물 목록 (ISR)
│   │   │   │   └── [slug]/page.tsx  # 건물 상세 (ISR)
│   │   │   ├── architects/     # 동일 패턴
│   │   │   └── cities/         # 동일 패턴
│   │   ├── diagram/page.tsx    # 다이어그램 (SSG + CSR)
│   │   ├── sitemap.ts          # 자동 sitemap
│   │   └── api/revalidate/     # On-demand ISR
│   │
│   ├── components/
│   │   ├── shared/ui/          # shadcn/ui + 커스텀 (EntityCard, ImageWithAttribution 등)
│   │   ├── features/
│   │   │   ├── map/            # 'use client' - MapContainer, MapMarker, MapFilterPanel
│   │   │   ├── building/       # BuildingCard(서버), BuildingDetail(서버), Gallery(클라이언트)
│   │   │   ├── architect/
│   │   │   ├── city/
│   │   │   └── diagram/        # 'use client' - DiagramView, DiagramNode
│   │   └── layouts/            # SiteHeader, SiteFooter, MapLayout
│   │
│   ├── lib/
│   │   ├── supabase/           # server.ts, client.ts, types.ts (자동 생성)
│   │   ├── queries/            # buildings.ts, architects.ts, cities.ts, map.ts
│   │   ├── utils/              # slug, geo, markdown, seo
│   │   └── constants/          # routes, map-config, categories
│   │
│   └── types/                  # database.ts, entities.ts, map.ts
│
├── scripts/                    # sync-from-sheets.ts, validate-data.ts, seed.ts
├── supabase/migrations/        # SQL 마이그레이션 파일들
└── public/
```

### 서버/클라이언트 분리 원칙

- **서버 컴포넌트 (기본)**: 목록, 상세 페이지, 레이아웃 → SEO + 초기 로딩 최적화
- **클라이언트 컴포넌트**: 지도, 필터, 다이어그램, 갤러리 → 브라우저 API/인터랙션 필요한 것만

---

## 3. Supabase 데이터 모델

### 핵심 테이블

| 테이블 | 용도 | 주요 필드 |
|--------|------|----------|
| `cities` | 도시 | name, slug, country_code, location(PostGIS), summary |
| `buildings` | 건축물 | name, slug, city_id(FK), location, year_start/end, style, desc_md, tags[] |
| `architects` | 건축가 | name, slug, birth/death_year, nationality, bio_md |
| `building_architects` | 다대다 관계 | building_id, architect_id, role |
| `entity_images` | 이미지 메타데이터 | entity_id, entity_type, url, license, creator, attribution |
| `shops` (future) | 숍 | address, open_hours(JSONB), shop_category |
| `events` (future) | 이벤트 | start/end_date, venue, organizer |

### 설계 포인트

- **PostGIS**: `location GEOGRAPHY(POINT, 4326)` — 반경 검색, 바운딩 박스 쿼리 지원
- **태그**: `TEXT[]` 배열 + GIN 인덱스 (MVP 규모에 충분, 별도 테이블은 오버엔지니어링)
- **상태**: `publish_status` enum (`draft → review → published → archived`)
- **RLS**: published만 공개 읽기, 인증된 큐레이터만 쓰기
- **뷰**: `buildings_with_architects`, `map_markers` (경량 마커 뷰)

---

## 4. 핵심 기능 구현 방법

### 4.1 Map Module

```
MapLibre GL JS + react-map-gl → 'use client' + dynamic import (ssr: false)
```

- **타일**: Protomaps(무료) 또는 MapTiler 무료 티어
- **클러스터링**: GeoJSON Source의 `cluster: true` (네이티브 지원, 구현 난이도 하)
- **멀티 선택**: Click 토글 + Shift+Click (MVP) → Lasso 선택 (후순위)
- **필터링**: URL searchParams 기반 (공유 가능) + 클라이언트 GeoJSON 필터링
- **초기 데이터**: 서버 컴포넌트에서 Supabase fetch → `map_markers` 뷰 → GeoJSON 변환 후 클라이언트에 전달

### 4.2 Diagram Mode

```
선택된 건물들 → 레이아웃 알고리즘 → SVG 렌더링 → html-to-image로 PNG export
```

- **레이아웃**: 그리드 배치 (연대순), 관계선 연결 (같은 건축가/도시/시대)
- **비주얼**: SVG 그리드 패턴 + 얇은 라인 + 모노크롬 + 건축 도면 감성
- **Export**: `html-to-image`의 `toPng()` (pixelRatio: 2로 레티나 대응)
- **구현 난이도**: 중-상 (레이아웃 알고리즘 + 디자인 품질이 관건)

### 4.3 Hero 비주얼

MVP에서는 **Framer Motion + SVG 애니메이션**으로 충분 (Three.js는 번들 ~150KB, 모바일 성능 리스크).
후순위로 Three.js/R3F 도입 시 `dynamic import + ssr: false + frameloop="demand"`.

### 4.4 SEO

- `generateMetadata()` — 동적 메타데이터
- `generateStaticParams()` — 상세 페이지 정적 생성
- ISR (revalidate: 60) — 데이터 갱신 반영
- `opengraph-image.tsx` — Edge Runtime OG 이미지 자동 생성
- Schema.org JSON-LD — 건축물에 `LandmarksOrHistoricalBuildings` 타입

---

## 5. 데이터 파이프라인

```
Google Sheets (큐레이터 입력) → scripts/sync-from-sheets.ts → Supabase
                                    │
                                    ├─ Google Sheets API로 데이터 읽기
                                    ├─ Zod 스키마로 검증
                                    ├─ PostGIS POINT 변환
                                    └─ Supabase upsert (slug 기준)
```

MVP에서는 **수동 스크립트 실행** (`npx tsx scripts/sync-from-sheets.ts`).
자동화는 콘텐츠 볼륨 증가 시 GitHub Actions cron 또는 Supabase Edge Function으로.

---

## 6. MVP 구현 로드맵

| Phase | 작업 | 예상 기간 |
|-------|------|----------|
| **1. 기반** | Supabase 셋업 + 마이그레이션 + Next.js 초기화 + Tailwind/shadcn | 1-2일 |
| **2. 데이터** | Sheets 동기화 스크립트 + seed 데이터 투입 + Supabase 타입 생성 | 1-2일 |
| **3. 아카이브** | 건물/건축가/도시 목록 + 상세 페이지 (서버 컴포넌트) | 3-4일 |
| **4. 지도** | MapLibre 맵 + 핀 + 클러스터링 + 필터 패널 + 멀티 선택 | 3-4일 |
| **5. 다이어그램** | 레이아웃 알고리즘 + SVG 렌더링 + PNG export | 3-4일 |
| **6. 홈/폴리시** | 히어로 (SVG 애니메이션) + 반응형 + SEO + OG 이미지 | 2-3일 |
| **7. 배포** | Vercel 연결 + 도메인 + 환경변수 | 0.5일 |

**총 예상: 약 2-3주** (풀타임 기준)

---

## 7. 주요 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 다이어그램 디자인 품질 | 서비스 인상 좌우 | 건축 다이어그램 레퍼런스 수집 선행, 프리셋 여러 개 준비 |
| 맵 타일 비용 | 운영 비용 | MapLibre + Protomaps (완전 무료) |
| 이미지 저작권 | 법적 리스크 | license 필드 NOT NULL, CC 이미지 우선, draft 상태로 보류 |
| Supabase 무료 한도 | 500MB DB, 1GB Storage | 건축 데이터 수천 건 이하 → 충분. Pro $25/월 |
| 모바일 맵 성능 | UX 저하 | 초기 마커 수 제한, 클러스터링, viewport 기반 로딩 |

---

## 8. 검증 방법

1. **빌드**: `next build` 성공 확인 (TypeScript 에러 없음)
2. **Lighthouse**: Performance > 90, SEO > 95
3. **맵 인터랙션**: 핀 클릭 → 프리뷰 → 상세 이동 → 뒤로가기 플로우
4. **멀티 선택 → 다이어그램**: 3-5개 건물 선택 → 다이어그램 생성 → PNG export
5. **데이터 파이프라인**: Sheets 수정 → 스크립트 실행 → 사이트 반영 확인
6. **반응형**: 모바일/태블릿/데스크탑 3가지 뷰포트 테스트
