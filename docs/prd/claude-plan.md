# Implementation Plan — Archi Curation Phase 2+3

## 1. Context

### 1.1 What We're Building
Archi Curation은 큐레이터가 직접 운영하는 건축/디자인 아카이빙 웹 프로젝트다. 건축물·건축가·도시를 지도 중심으로 탐색하고, 선택한 장소를 다이어그램/그래픽으로 전환하는 경험을 제공한다.

이 계획은 **Phase 2 (Core Archive 완성) + Phase 3 (Visual Interaction 개선)**을 다룬다.

### 1.2 Current State
- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, Zustand, MapLibre GL 5.22, D3.js 7.9, next-intl
- **Pages**: Home, Map, Buildings (list/detail), Architects (list/detail), Cities (list/detail), Diagram, About — 모두 EN/KO i18n 지원
- **Map**: OpenFreeMap tiles, DOM-based markers, popup cards, architect legend, selection sidebar (max 10)
- **Diagram**: D3 force-directed graph (Force/Timeline/Geography modes), PNG export via html-to-image
- **Design**: Achromatic (Geist Mono, flat, 40px grid overlay, OKLCh tokens)
- **Data**: Static JSON files (~4 buildings, 4 architects, 2-3 cities), Shop/Event types defined but no data/UI

### 1.3 Goals
1. 홈 전면 재디자인 — 포트폴리오적 인상
2. 지도 필터링 UI — 도시/태그로 탐색
3. 마커 클러스터링 — 50개+ 대응
4. 다이어그램 폴리시 + 2차 그래픽 전환 탐색
5. Shops/Events 기본 UI
6. 데이터 파이프라인 경로 준비 (JSON → Google Sheets)
7. 이미지 최적화 + 레이아웃 시프트 방지
8. 모든 새 기능 EN/KO i18n

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Pages (App Router)                                         │
│  ┌─────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ │
│  │Home │ │Map+Filter│ │Buildings │ │Diagram  │ │Shops/   │ │
│  │(new)│ │(enhanced)│ │Architects│ │(enhanced│ │Events   │ │
│  │     │ │         │ │Cities    │ │+2nd gen)│ │(new)    │ │
│  └──┬──┘ └────┬────┘ └────┬─────┘ └────┬────┘ └────┬────┘ │
│     │         │            │            │           │       │
│  ┌──┴─────────┴────────────┴────────────┴───────────┴──┐    │
│  │  Components Layer                                    │    │
│  │  - HomeHero (new)     - MapFilter (new)              │    │
│  │  - ClusterMap (new)   - DiagramRenderer (enhanced)   │    │
│  │  - ShopCard (new)     - EventCard (new)              │    │
│  │  - OptimizedImage (new)                              │    │
│  └──────────────────────────┬───────────────────────────┘    │
│                             │                                │
│  ┌──────────────────────────┴───────────────────────────┐    │
│  │  Data Layer                                           │    │
│  │  - data.ts (enhanced: shops, events, filters)         │    │
│  │  - selection-store.ts (existing)                       │    │
│  │  - shops.json, events.json (new)                      │    │
│  │  - CSV→JSON script (new)                              │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Sections

### Section 1: Image Optimization Foundation
**Priority**: High (다른 모든 섹션의 기반)
**Dependencies**: None

이미지 레이아웃 시프트 방지와 성능 최적화를 먼저 구현한다. 이후 모든 새 페이지/컴포넌트가 이 패턴을 따른다.

**Tasks**:
1. Next.js Image 컴포넌트 래퍼 생성 (`OptimizedImage`)
   - width/height 필수, aspect-ratio CSS fallback
   - blur placeholder 지원 (blurDataURL)
   - Skeleton 로더 상태
   - `sizes` prop으로 반응형 대응
2. 기존 컴포넌트 마이그레이션
   - buildings 리스트/상세 이미지
   - architects 포트레이트
   - cities 커버 이미지
3. 이미지 메타데이터 구조에 width/height 필드 추가 (ImageMeta 타입)

**Files to create/modify**:
- `src/components/shared/optimized-image.tsx` (new)
- `src/types/entities.ts` (ImageMeta에 width/height 추가)
- `src/app/[locale]/map/buildings/page.tsx`
- `src/app/[locale]/map/buildings/[slug]/page.tsx`
- `src/app/[locale]/map/architects/page.tsx`
- `src/app/[locale]/map/cities/page.tsx`

**Acceptance Criteria**:
- [ ] 모든 이미지에 Layout Shift 없음 (CLS = 0)
- [ ] Skeleton/placeholder 표시 후 이미지 로드
- [ ] 반응형 이미지 사이즈 적용

---

### Section 2: Map Enhancement — Filtering + Clustering
**Priority**: High
**Dependencies**: None (병렬 진행 가능)

지도에 도시/태그 필터링 UI를 추가하고, DOM 마커를 symbol layer + 클러스터링으로 마이그레이션한다.

**Tasks**:

#### 2a. Map Filter UI
1. MapFilter 컴포넌트 생성
   - 도시 선택 드롭다운 (현재 cities 데이터 기반)
   - 태그 칩 필터 (getAllTags() 기반)
   - 선택된 필터 표시 + "초기화" 버튼
   - 지도 상단에 오버레이 배치
2. 필터 상태 관리
   - URL search params로 필터 상태 유지 (공유 가능)
   - `useSearchParams` + `useRouter` 활용
3. 필터 적용 시 마커 업데이트
   - 필터된 buildings만 GeoJSON source에 반영
   - 부드러운 전환 (fade in/out)

#### 2b. Symbol Layer + Clustering
1. DOM 마커 → MapLibre GL symbol layer로 마이그레이션
   - GeoJSON source 구성 (`buildings` → FeatureCollection)
   - `cluster: true`, `clusterRadius: 50`, `clusterMaxZoom: 14`
   - Circle layer for unclustered points (architect color 매핑)
   - Symbol layer for cluster counts
2. 클러스터 인터랙션
   - 클러스터 클릭 → zoom into cluster (`getClusterExpansionZoom`)
   - 개별 마커 클릭 → 기존 popup + selection 동작 유지
3. Architect Legend 업데이트 (symbol layer 색상과 동기화)

**Files to create/modify**:
- `src/components/features/map/map-filter.tsx` (new)
- `src/components/features/map/map-view.tsx` (major refactor)
- `src/components/features/map/building-marker.tsx` (may be removed/replaced)
- `src/components/features/map/building-popup.tsx` (adapt to symbol layer)
- `src/app/[locale]/map/page.tsx`
- `messages/en.json`, `messages/ko.json` (필터 관련 키 추가)

**Acceptance Criteria**:
- [ ] 도시 필터 선택 시 해당 도시의 마커만 표시
- [ ] 태그 필터 선택 시 해당 태그의 마커만 표시
- [ ] 복합 필터 (도시 + 태그) 동작
- [ ] 필터 초기화 동작
- [ ] 클러스터 표시 및 클릭 시 확대
- [ ] 개별 마커 클릭 시 popup + selection 동작
- [ ] URL에 필터 상태 반영

---

### Section 3: Home Page Redesign
**Priority**: High
**Dependencies**: Section 1 (OptimizedImage)

홈 페이지를 포트폴리오적 인상을 주도록 전면 재디자인한다.

**Tasks**:
1. 새로운 HomeHero 컴포넌트
   - 그리드 기반 히어로 레이아웃 (DESIGN.md 토큰 활용)
   - 건축적 라인 모션 (SVG path animation 또는 CSS)
   - 타이포그래피 중심 (Geist Mono, light weight)
   - "Archi Curation" 브랜드 메시지
2. 진입점 재구성
   - Map, Buildings, Architects, Featured 섹션
   - 각 진입점에 미리보기 데이터 표시 (건축물 수, 도시 수 등)
   - 호버 인터랙션 (subtle, 건축적)
3. 홈 콘텐츠 구성 (유연하게 결정)
   - Featured/큐레이션 셀렉션은 제거 또는 최소화
   - 무엇을 넣을지는 재디자인 과정에서 결정
   - 핵심: 히어로 + 진입점이 사이트의 인상을 만든다
4. 전체 스크롤 경험
   - 섹션 간 부드러운 전환
   - Framer Motion 활용 (기존 motion-wrapper 패턴)

**Files to create/modify**:
- `src/app/[locale]/page.tsx` (major rewrite)
- `src/components/features/home/home-hero.tsx` (new)
- `src/components/features/home/home-entry-points.tsx` (new)
- `src/components/features/home/home-featured.tsx` (optional — 필요 시)
- `src/components/features/home/line-animation.tsx` (new)
- `messages/en.json`, `messages/ko.json` (홈 관련 키 업데이트)

**Acceptance Criteria**:
- [ ] 그리드 기반 히어로가 사이트 성격을 전달
- [ ] 라인 모션이 부드럽고 건축적 느낌
- [ ] 4개 이상의 진입점 제공
- [ ] 홈 콘텐츠 구성 결정 (Featured는 선택 사항)
- [ ] 모바일 반응형
- [ ] EN/KO 양언어 지원
- [ ] Lighthouse Performance 90+

---

### Section 4: Shops & Events Module
**Priority**: Medium
**Dependencies**: Section 1 (OptimizedImage), Section 2 (Map — shops/events markers)

기존 데이터 모델을 활용하여 Shops/Events의 기본 리스트 + 상세 페이지를 구현한다.

**Tasks**:
1. 시드 데이터 생성
   - `shops.json` (2-3개 — 가구 숍, 디자인 서점 등)
   - `events.json` (2-3개 — 건축 전시, 디자인 페어 등)
2. 데이터 쿼리 함수 추가 (`data.ts`)
   - getShops, getShopBySlug, getShopsByCity
   - getEvents, getEventBySlug, getEventsByCity
3. 리스트 페이지
   - `/map/shops/page.tsx` — 그리드 뷰 (ShopCard)
   - `/map/events/page.tsx` — 그리드 뷰 (EventCard)
   - 태그/도시 필터 (buildings와 동일 패턴)
4. 상세 페이지
   - `/map/shops/[slug]/page.tsx`
   - `/map/events/[slug]/page.tsx`
   - 기존 building detail과 동일한 구조 패턴
5. 네비게이션 업데이트
   - SiteHeader에 Shops/Events 링크 추가
   - 모바일 메뉴에도 반영
6. 지도 통합
   - Map에 shop/event 마커 표시 (타입별 색상/아이콘 구분)
   - 필터에서 엔티티 타입 선택 가능

**Files to create/modify**:
- `src/lib/data/shops.json` (new)
- `src/lib/data/events.json` (new)
- `src/lib/data/data.ts` (add shop/event queries)
- `src/app/[locale]/map/shops/page.tsx` (new)
- `src/app/[locale]/map/shops/[slug]/page.tsx` (new)
- `src/app/[locale]/map/events/page.tsx` (new)
- `src/app/[locale]/map/events/[slug]/page.tsx` (new)
- `src/components/features/shops/shop-card.tsx` (new)
- `src/components/features/events/event-card.tsx` (new)
- `src/components/layouts/site-header.tsx` (update nav)
- `messages/en.json`, `messages/ko.json`

**Acceptance Criteria**:
- [ ] Shops 리스트/상세 페이지 동작
- [ ] Events 리스트/상세 페이지 동작
- [ ] 각 2-3개 시드 데이터 표시
- [ ] 네비게이션에서 접근 가능
- [ ] 지도에 shop/event 마커 표시
- [ ] EN/KO i18n 지원
- [ ] generateStaticParams로 정적 생성

---

### Section 5: Diagram Enhancement + 2nd Generation Graphics
**Priority**: Medium
**Dependencies**: None (독립적)

현재 다이어그램의 시각적 품질을 높이고, 2차 그래픽 전환을 위한 아키텍처를 마련한다.

**Tasks**:
1. 현재 다이어그램 폴리시
   - 노드 스타일 개선 (크기, 색상, 테두리)
   - 라벨 가독성 향상 (배경 박스, 폰트 크기 조정)
   - 링크 스타일 개선 (곡선, 두께 변화)
   - 그리드 배경 정제
2. 레이아웃 전환 아키텍처 확장
   - 레이아웃 모드를 플러그인 패턴으로 리팩토링
   - `DiagramLayout` 인터페이스 정의
   - 각 레이아웃(Force/Timeline/Geography)을 독립 모듈로 분리
3. 2차 그래픽 전환 — Blueprint 모드 (도면풍)
   - 정렬된 그리드 레이아웃 (건축 도면 감각)
   - 건축물을 row/column에 배치
   - 연결선은 직각 또는 45도 각도
   - 라벨/번호 체계
   - 도면 프레임 (border + title block)
4. 2차 그래픽 전환 — Poster 모드 (포스터풍)
   - 인쇄 가능한 A3/A4 비율 캔버스
   - 대형 타이포그래피 타이틀
   - 건축물 정보를 카드형으로 배치
   - 지리적 추상 요소 (도시 위치 hint)
   - 큐레이션 캡션 영역
5. 모드 전환 UI 업데이트
   - LayoutControls에 Blueprint/Poster 모드 추가
   - 전환 애니메이션

**Files to create/modify**:
- `src/components/features/diagram/network-diagram.tsx` (refactor)
- `src/components/features/diagram/layouts/` (new directory)
  - `types.ts` — DiagramLayout 인터페이스
  - `force-layout.ts`
  - `timeline-layout.ts`
  - `geography-layout.ts`
  - `blueprint-layout.ts` (new)
  - `poster-layout.ts` (new)
- `src/components/features/diagram/layout-controls.tsx` (update)
- `src/components/features/diagram/diagram-view.tsx` (update)
- `messages/en.json`, `messages/ko.json`

**Acceptance Criteria**:
- [ ] 기존 3개 레이아웃 시각적 개선
- [ ] Blueprint 모드 — 도면풍 그리드 배치 동작
- [ ] Poster 모드 — 포스터풍 레이아웃 동작
- [ ] 레이아웃 전환이 부드러움
- [ ] 새 레이아웃 추가가 용이한 구조
- [ ] PNG export가 모든 모드에서 동작

---

### Section 6: Data Pipeline Preparation
**Priority**: Low (인프라)
**Dependencies**: Section 4 (Shops/Events 데이터 구조 확정 후)

JSON 운영을 유지하면서 Google Sheets 마이그레이션 경로를 준비한다.

**Tasks**:
1. 스키마 매핑 문서 작성
   - JSON 구조 ↔ Google Sheets 탭/열 매핑
   - Buildings, Architects, Cities, Shops, Events 각각
   - 이미지 메타데이터 처리 방안
2. CSV → JSON 변환 스크립트
   - `scripts/csv-to-json.ts` 구현
   - CSV 파싱 → 타입 변환 → JSON 출력
   - 데이터 검증: slug 중복, 좌표 범위, 필수 필드
   - 에러 리포트 출력
3. 데이터 검증 유틸리티
   - `scripts/validate-data.ts`
   - 전체 JSON 데이터 무결성 검사
   - CI에서 실행 가능 (npm run validate)
4. GitHub Actions 워크플로우 템플릿
   - `.github/workflows/sync-data.yml` (수동 트리거)
   - Google Sheets API 호출 → CSV 다운로드 → 변환 → PR 생성
   - 실제 API 연동은 미구현 (템플릿만)

**Files to create/modify**:
- `docs/data-pipeline.md` (new — 스키마 매핑 문서)
- `scripts/csv-to-json.ts` (new)
- `scripts/validate-data.ts` (new)
- `.github/workflows/sync-data.yml` (new — template)
- `package.json` (validate script 추가)

**Acceptance Criteria**:
- [ ] 스키마 매핑 문서 작성 완료
- [ ] CSV → JSON 변환 스크립트 동작
- [ ] 데이터 검증 스크립트 동작
- [ ] `npm run validate` 명령어 실행 가능
- [ ] GitHub Actions 워크플로우 템플릿 존재

---

## 4. Dependency Graph

```
Section 1 (Image Optimization)
    ├──→ Section 3 (Home Redesign)
    └──→ Section 4 (Shops/Events)

Section 2 (Map Enhancement)
    └──→ Section 4 (Shops/Events — map markers)

Section 5 (Diagram Enhancement) — independent

Section 6 (Data Pipeline)
    └── depends on Section 4 (data structure finalized)
```

**Recommended Execution Order**:
1. Section 1 (Image Optimization) + Section 2 (Map) + Section 5 (Diagram) — 병렬
2. Section 3 (Home Redesign) — Section 1 완료 후
3. Section 4 (Shops/Events) — Section 1 + 2 완료 후
4. Section 6 (Data Pipeline) — Section 4 완료 후

---

## 5. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Symbol layer 마이그레이션으로 기존 popup/selection 동작 깨짐 | High | 기존 DOM 마커를 fallback으로 유지하며 점진 전환 |
| 2차 그래픽 전환 기획 불확실 | Medium | Blueprint/Poster를 프로토타입으로 구현, 피드백 후 방향 결정 |
| 홈 재디자인 범위 확대 | Medium | 히어로 + 진입점 + Featured로 한정, 추가 섹션은 이후 |
| Shops/Events 데이터 부족 | Low | 최소 2-3개 시드로 시작, 구조만 검증 |
| 이미지 최적화 시 기존 이미지 깨짐 | Low | ImageMeta에 width/height optional로 추가, 점진 마이그레이션 |

---

## 6. i18n Checklist

모든 섹션에서 새로 추가되는 UI 문자열은:
- `messages/en.json`에 영문 키 추가
- `messages/ko.json`에 한국어 키 추가
- 하드코딩 문자열 사용 금지
- 번역 키 네이밍: `{module}.{context}.{element}` (예: `map.filter.city`, `diagram.layout.blueprint`)

---

## 7. Testing Strategy

- **Build**: `npm run build` 성공 확인 (모든 섹션 완료 후)
- **Visual**: 각 페이지 EN/KO에서 수동 확인
- **Performance**: Lighthouse 기준 Performance 90+, CLS 0
- **Responsive**: sm/md/lg breakpoint 확인
- **Map**: 50개+ 마커에서 클러스터링 동작 확인
- **Diagram**: 모든 레이아웃 모드에서 PNG export 확인
