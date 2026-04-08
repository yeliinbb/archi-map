# Synthesized Specification — Archi Curation Phase 2+3

## 1. Overview

Archi Curation은 큐레이터가 직접 운영하는 건축/디자인 아카이빙 웹 프로젝트다. MVP는 건축물·건축가·도시를 지도 중심으로 탐색하고, 선택한 장소를 다이어그램/그래픽으로 전환하는 경험에 집중한다.

이 스펙은 **Phase 2 (Core Archive 완성) + Phase 3 (Visual Interaction 개선)**을 범위로 한다.

### 현재 상태
- Next.js 16 App Router + TypeScript + Tailwind CSS 4 + shadcn/ui
- MapLibre GL 5.22 + react-map-gl 8.1 (인터랙티브 지도)
- D3.js 7.9 (force-directed 다이어그램, 3개 레이아웃 모드)
- Zustand (선택 스토어, max 10)
- next-intl (EN/KO i18n)
- 데이터: JSON 파일 (~4 buildings, 4 architects, 2-3 cities)
- html-to-image PNG export (pixelRatio: 2)
- 아크로매틱 디자인 시스템 (Geist Mono, 40px 그리드 오버레이)

---

## 2. Implementation Scope

### 2.1 홈 전면 재디자인
**현재**: 히어로 + 4개 엔트리 카드
**목표**: 포트폴리오적 인상을 주는 그리드 기반 히어로 + 라인/모션 요소

요구사항:
- 그리드 기반의 강한 히어로 섹션
- 건축적 라인 모션 (가벼운 SVG/CSS 애니메이션)
- 진입점: Map, Buildings, Architects, Featured city/curation
- "큐레이터 중심 아카이브"라는 메시지 전달
- 사용자가 몇 초 안에 사이트 성격을 이해할 것
- 포트폴리오 자산으로 활용 가능한 수준

### 2.2 지도 필터링 UI
**현재**: 마커만 표시, 필터 UI 없음 (buildings 리스트에는 태그 필터 있음)
**목표**: 도시/태그 필터를 지도에 추가

요구사항:
- 도시 드롭다운 또는 칩 필터
- 태그/스타일 필터 (chips)
- 필터 적용 시 마커 즉시 업데이트
- 선택된 필터 상태 표시 + 초기화 버튼
- 기존 buildings 리스트의 필터와 일관된 UX

### 2.3 마커 클러스터링
**현재**: DOM 기반 개별 마커
**목표**: 50개+ 건축물에서도 성능 유지

요구사항:
- MapLibre GL symbol layer 기반 클러스터링
- `cluster: true` + `clusterRadius` 설정
- 클러스터 클릭 시 확대 (zoom into cluster)
- 클러스터 해제 시 개별 마커로 전환
- 현재 popup/selection 인터랙션과 호환

### 2.4 다이어그램 개선 + 2차 그래픽 전환 탐색
**현재**: D3 force/timeline/geography 3개 레이아웃 + PNG export
**목표**: 디자인 폴리시 + 2차 그래픽 전환 기반 마련

요구사항:
- 현재 3개 레이아웃 디자인 개선 (노드 스타일, 라벨, 색상)
- **2차 그래픽 전환 탐색** (기획 방향성 고민 필요):
  - Option A: 도면풍 그리드 레이아웃 — 건축 도면처럼 정렬된 그리드 + 라벨 + 선
  - Option B: 포스터풍 프린트 — 인쇄 가능한 포스터 스타일 그래픽
  - 두 방향 모두 프로토타입하여 테스트
- 구현 시 레이아웃 모드 전환 아키텍처 확장 (새 모드 추가 용이하게)

### 2.5 Shops/Events 기본 UI
**현재**: 데이터 모델만 존재 (entities.ts에 타입 정의)
**목표**: 기본 리스트 + 상세 페이지

요구사항:
- `/map/shops` 리스트 페이지 (그리드 뷰)
- `/map/shops/[slug]` 상세 페이지
- `/map/events` 리스트 페이지 (그리드 뷰)
- `/map/events/[slug]` 상세 페이지
- 네비게이션에 추가
- 시드 데이터 최소 2-3개씩 준비
- 지도에 Shop/Event 마커도 표시 (타입별 구분)

### 2.6 데이터 파이프라인 준비
**현재**: JSON 파일 직접 편집
**목표**: JSON 유지하되 Google Sheets 마이그레이션 경로 준비

요구사항:
- 현재 JSON 구조를 Google Sheets 스키마로 매핑하는 문서 작성
- CSV → JSON 변환 스크립트 구현
- 데이터 검증 로직 (slug 중복, 좌표 유효성, 필수 필드)
- GitHub Actions 워크플로우 템플릿 (수동 트리거)
- 실제 마이그레이션은 이번 범위 외 (경로만 준비)

### 2.7 이미지 최적화 + 레이아웃 시프트 방지
**현재**: 이미지 처리가 기본적
**목표**: CLS 제거 + 성능 최적화

요구사항:
- Next.js Image 컴포넌트 활용 (width/height 명시)
- 모든 이미지에 `aspect-ratio` 또는 placeholder 적용
- Lazy loading (viewport 밖 이미지)
- 적절한 `sizes` prop으로 반응형 이미지
- 커버 이미지의 blur placeholder 생성
- Skeleton 로더 또는 aspect-ratio box로 CLS 방지

---

## 3. Technical Decisions

### 3.1 Map Architecture
- DOM 마커 → MapLibre GL symbol layer로 마이그레이션
- GeoJSON source with clustering enabled
- 필터링: MapLibre `setFilter()` expression 사용
- Popup: `queryRenderedFeatures()` + custom popup 컴포넌트

### 3.2 Diagram Architecture
- 현재 D3.js force simulation 유지
- 새 레이아웃 모드는 플러그인 패턴으로 추가 가능하게 설계
- 2차 그래픽 전환은 별도 렌더러 (SVG template 또는 Canvas)로 구현
- Export는 html-to-image 유지 (PNG, pixelRatio: 2)

### 3.3 Data Layer
- JSON 파일 유지 (src/lib/data/)
- Shops/Events JSON 파일 추가
- data.ts에 getShops/getEvents 쿼리 함수 추가
- CSV → JSON 변환 스크립트 (scripts/ 디렉토리)

### 3.4 i18n
- 모든 새 UI 문자열은 messages/en.json, ko.json에 추가
- 하드코딩 문자열 금지 규칙 유지

### 3.5 Design System
- DESIGN.md의 아크로매틱 시스템 유지
- 홈 재디자인 시 기존 토큰 활용
- 새 컴포넌트도 Geist Mono + flat + grid 원칙 준수

---

## 4. Out of Scope (이번 계획 제외)

- Supabase DB 전환
- AI 기반 추천/큐레이션
- 사용자 계정/로그인
- Export 포맷 확장 (WebP, SVG)
- 데이터 50개+ 확장 (점진적으로 별도 진행)
- 3D 시각화 (Three.js/R3F)
- 커뮤니티/소셜 기능

---

## 5. Success Criteria

1. 홈이 포트폴리오적 인상을 준다
2. 지도에서 도시/태그로 필터링하여 탐색할 수 있다
3. 50개+ 마커에서도 지도가 부드럽게 동작한다
4. 다이어그램 결과물이 현재보다 시각적으로 개선된다
5. Shops/Events 기본 탐색이 가능하다
6. 이미지 로딩 시 레이아웃 시프트가 없다
7. Google Sheets 마이그레이션 경로가 문서화된다
8. 모든 UI가 EN/KO 양언어로 동작한다
