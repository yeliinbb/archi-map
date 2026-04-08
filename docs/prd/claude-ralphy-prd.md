# Archi Curation Phase 2+3 — Ralphy PRD

## Project

**Name**: Archi Curation Phase 2+3
**Summary**: 건축 큐레이션 웹 애플리케이션의 Phase 2+3 구현. 이미지 최적화, 지도 필터링/클러스터링, 홈 페이지 재디자인, Shops/Events 모듈, 다이어그램 확장, 데이터 파이프라인 준비 6개 섹션으로 구성.

## Usage

```bash
ralphy --prd docs/prd/claude-ralphy-prd.md
```

## Context

Archi Curation은 건축물, 건축가, 도시를 아카이빙하는 큐레이션 웹 애플리케이션이다.

**Tech Stack**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, MapLibre GL JS, D3.js, Zustand

**Key Conventions**:
- 컴포넌트: `function` 선언식, Props: `interface`, 조건부 렌더링: 삼항 연산자 (`&&` 금지)
- 모든 UI 문자열: i18n 키 사용 (`messages/en.json`, `messages/ko.json`)
- Tailwind 테마 토큰만 사용, 하드코딩 색상값 금지
- 커밋: `{type}: 한국어 설명`
- 각 섹션 완료 후 `npm run build` 성공 확인

## Section Files

모든 섹션의 상세 구현 명세는 아래 디렉토리에 위치한다:

```
docs/prd/sections/
├── index.md                          # 의존성 그래프 + 실행 순서
├── section-01-image-optimization.md  # Next.js Image 래퍼, CLS 제거
├── section-02-map-enhancement.md     # 필터링 UI, Symbol Layer + 클러스터링
├── section-03-home-redesign.md       # 홈 페이지 전면 재디자인
├── section-04-shops-events.md        # Shops/Events 데이터 + UI + 지도 통합
├── section-05-diagram-enhancement.md # 다이어그램 폴리시 + Blueprint/Poster 모드
└── section-06-data-pipeline.md       # CSV→JSON 스크립트, 검증, GH Actions 템플릿
```

**Execution Order** (from `docs/prd/sections/index.md`):

1. **Wave 1** (병렬 가능): Section 01, Section 02, Section 05
2. **Wave 2** (Section 01 완료 후): Section 03
3. **Wave 3** (Section 01 + 02 완료 후): Section 04
4. **Wave 4** (Section 04 완료 후): Section 06

## Tasks

- [ ] **Section 01: Image Optimization Foundation** — `docs/prd/sections/section-01-image-optimization.md`
  - OptimizedImage 래퍼 컴포넌트 생성 (`src/components/shared/optimized-image.tsx`)
  - 기존 4곳의 `<img>` 태그를 `<OptimizedImage>`로 마이그레이션
  - JSON 데이터에 width/height 값 보강
  - CLS 제거, Skeleton placeholder, 반응형 sizes prop 적용

- [ ] **Section 02: Map Enhancement — Filtering + Clustering** — `docs/prd/sections/section-02-map-enhancement.md`
  - MapFilter 컴포넌트 리팩토링 (도시 드롭다운 + 태그 칩)
  - 필터 상태 URL search params 연동
  - DOM 마커 → MapLibre GL GeoJSON Source + Layer 마이그레이션
  - 클러스터링 구현 (클러스터 클릭 → 줌 인)
  - 모든 UI 문자열 i18n 적용

- [ ] **Section 03: Home Page Redesign** — `docs/prd/sections/section-03-home-redesign.md`
  - HomeHero 컴포넌트 (그리드 기반, Geist Mono 타이포그래피)
  - HomeEntryPoints 컴포넌트 (4개 진입점 그리드)
  - LineAnimation 컴포넌트 (SVG 건축적 라인 드로잉, CSS animation)
  - Featured 섹션 제거/최소화
  - page.tsx 전면 재작성

- [ ] **Section 04: Shops & Events Module** — `docs/prd/sections/section-04-shops-events.md`
  - shops.json, events.json 시드 데이터 생성
  - data.ts에 Shop/Event 쿼리 함수 추가
  - 리스트 페이지 + 상세 페이지 (shops, events)
  - ShopCard, EventCard 컴포넌트
  - 네비게이션 업데이트, 지도 마커 통합

- [ ] **Section 05: Diagram Enhancement + 2nd Generation Graphics** — `docs/prd/sections/section-05-diagram-enhancement.md`
  - 기존 노드/링크/라벨/그리드 시각적 폴리시
  - DiagramLayout 플러그인 아키텍처로 리팩토링
  - Blueprint 모드 (도면풍 그리드, 직각 연결선, 프레임)
  - Poster 모드 (A3/A4 비율, 대형 타이틀, 카드형 배치)
  - LayoutControls 5개 모드 (Analysis + Graphics 그룹)

- [ ] **Section 06: Data Pipeline Preparation** — `docs/prd/sections/section-06-data-pipeline.md`
  - 스키마 매핑 문서 (`docs/data-pipeline.md`)
  - CSV → JSON 변환 스크립트 (`scripts/csv-to-json.ts`)
  - 데이터 검증 유틸리티 (`scripts/validate-data.ts`)
  - GitHub Actions 워크플로우 템플릿 (`.github/workflows/sync-data.yml`)
  - `npm run validate` 스크립트 추가
