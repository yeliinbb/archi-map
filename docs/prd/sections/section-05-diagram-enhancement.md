# Section 5: Diagram Enhancement + 2nd Generation Graphics

## Background

현재 다이어그램은 D3.js force-directed graph로 구현되어 있으며, Force / Timeline / Geography 세 가지 레이아웃 모드를 제공한다. 선택된 건축물-건축가-도시 간의 관계를 시각화하는 핵심 기능이다.

이 섹션에서는 두 가지 방향의 작업을 진행한다:

1. **기존 다이어그램 폴리시** — 노드, 링크, 라벨, 그리드 배경의 시각적 품질 향상
2. **2차 그래픽 전환 모드 프로토타입** — Blueprint(도면풍 그리드)와 Poster(포스터풍 프린트) 두 가지 새로운 모드 탐색

2차 그래픽 모드는 탐색적 프로토타입이다. 유저가 결과물을 평가한 뒤 방향을 결정하며, 완성도보다 가능성 검증에 초점을 둔다.

---

## Current State

### 파일 구성

| 파일 | 줄 수 | 역할 |
|------|-------|------|
| `src/components/features/diagram/network-diagram.tsx` | 328 | D3 렌더링, 레이아웃 로직, 줌/드래그, 툴팁 |
| `src/components/features/diagram/diagram-view.tsx` | 83 | 컨테이너, ResizeObserver, 레이아웃/익스포트 컨트롤 |
| `src/components/features/diagram/layout-controls.tsx` | 35 | Force/Timeline/Geography 모드 토글 버튼 |
| `src/components/features/diagram/export-button.tsx` | 39 | html-to-image PNG 익스포트 (pixelRatio: 2) |
| `src/components/features/diagram/diagram-empty.tsx` | - | 선택 없음 상태 UI |
| `src/lib/diagram/transform.ts` | 122 | 데이터 → DiagramGraph 변환 (nodes, links) |

### 렌더링 세부사항

- **D3.js 7.9** force simulation (`forceLink`, `forceManyBody`, `forceCenter`, `forceCollide`)
- **노드 3종**: building(circle, r=18), architect(rounded rect, r=14), city(triangle, r=12)
- **링크 3종**: architect-building(실선, 1px), city-building(실선, 1px), same-architect(점선, 0.5px)
- **그리드 배경**: 40px SVG pattern, `oklch(0.145 0 0 / 5%)` 스트로크
- **줌/팬**: `d3.zoom`, scaleExtent `[0.3, 4]`
- **드래그**: `d3.drag` (force simulation alpha 연동)
- **툴팁**: React state 기반, mouseenter/mouseleave
- **라벨**: Geist Mono 9px, opacity 0.7, 배경 박스 없음
- **워터마크**: "Archi Curation" 우하단 고정

### 레이아웃 모드

- **Force**: 기본 force simulation (center + charge + collide)
- **Timeline**: `forceX`에 year 기반 `scaleLinear` 적용, `forceY` 약한 중심 당김
- **Geography**: `forceX`/`forceY`에 lng/lat 기반 scale 적용

세 레이아웃 모두 `network-diagram.tsx`의 단일 `useEffect` 안에 조건문(`if/else if`)으로 하드코딩되어 있다.

### 데이터 흐름

```
Building[] + Architect[] + City[]
  → buildDiagramGraph() (transform.ts)
  → DiagramGraph { nodes: DiagramNode[], links: DiagramLink[] }
  → NetworkDiagram (d3 렌더링)
```

### i18n 키 (현재)

```json
{
  "diagram": {
    "title": "Diagram",
    "stats": "{buildings} buildings · {architects} architects · {cities} cities",
    "exportPng": "Export PNG",
    "layout": {
      "force": "Force",
      "timeline": "Timeline",
      "geography": "Geography"
    }
  }
}
```

---

## Dependencies

| 방향 | 대상 | 설명 |
|------|------|------|
| depends on | - | 독립적 (다른 섹션에 의존하지 않음) |
| blocks | - | 다른 섹션을 차단하지 않음 |

Wave 1에서 Section 1, Section 2와 병렬 진행 가능.

---

## Implementation Details

### Task 1: 기존 레이아웃 시각적 폴리시

현재 노드/링크/라벨의 기본 스타일을 디자인 시스템과 일관되게 개선한다.

#### 1-1. 노드 스타일 개선

- 노드 크기 미세 조정 (building 20, architect 16, city 14 검토)
- `stroke`를 `var(--background)` 대신 디자인 토큰 기반 보더로 변경
- shadow 없이 flat 유지 (achromatic 디자인 원칙)
- hover 시 노드 확대 또는 보더 강조 (subtle transition)

#### 1-2. 라벨 가독성 향상

- 라벨에 배경 박스 추가 (`rect` behind `text`, `var(--background)` fill, padding 2-4px)
- 폰트 크기 9px → 10px 검토
- opacity 0.7 → 0.85 검토
- 긴 라벨 truncation (max 15자 + ellipsis)

#### 1-3. 링크 스타일 개선

- 직선(`line`) → 곡선(`path` with `d3.linkHorizontal` 또는 `curveBasis`) 검토
- architect-building 링크: 1px → 1.5px, 색상 contrast 강화
- city-building 링크: 색상 구분 (별도 토큰)
- same-architect 링크: 점선 패턴 세분화 (`3 3`)
- hover 시 연결된 링크 하이라이트

#### 1-4. 그리드 배경 정제

- 40px 패턴 유지, 스트로크 색상 미세 조정
- 보조 그리드 라인 (200px 간격, 약간 더 진한 색) 추가 검토
- 줌 레벨에 따른 그리드 표시 조절 (먼 거리에서는 보조 그리드만 표시)

---

### Task 2: 레이아웃 아키텍처 플러그인 패턴 리팩토링

`network-diagram.tsx`의 레이아웃 로직을 독립 모듈로 분리하여 새 레이아웃 추가가 용이한 구조를 만든다.

#### 2-1. DiagramLayout 인터페이스 정의

```ts
// src/components/features/diagram/layouts/types.ts

import type { DiagramNode, DiagramLink } from "@/lib/diagram/transform";
import type * as d3 from "d3";

interface LayoutContext {
  width: number;
  height: number;
  nodes: DiagramNode[];
  links: DiagramLink[];
}

interface DiagramLayout {
  name: string;
  label: string; // i18n key suffix (e.g., "force" → t("diagram.layout.force"))
  applyLayout: (
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
    context: LayoutContext
  ) => void;
  getNodePosition?: (node: DiagramNode, context: LayoutContext) => { x: number; y: number };
  renderOverlay?: (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    context: LayoutContext
  ) => void;
}
```

- `applyLayout`: force simulation에 레이아웃별 force를 설정한다
- `getNodePosition`: force simulation을 사용하지 않는 정적 레이아웃용 (Blueprint, Poster)
- `renderOverlay`: 레이아웃별 추가 SVG 요소 (Blueprint 프레임, Poster 타이틀 등)

#### 2-2. 기존 레이아웃 분리

```
src/components/features/diagram/layouts/
  types.ts          — DiagramLayout interface + LayoutContext
  force-layout.ts   — Force 레이아웃 (기본 simulation)
  timeline-layout.ts — Timeline 레이아웃 (year → x축)
  geography-layout.ts — Geography 레이아웃 (lng/lat → x/y)
  index.ts          — 레이아웃 레지스트리 (LAYOUTS map)
```

각 파일은 `DiagramLayout` 인터페이스를 구현하는 객체를 `export`한다:

```ts
// src/components/features/diagram/layouts/force-layout.ts
import type { DiagramLayout } from "./types";

export const forceLayout: DiagramLayout = {
  name: "force",
  label: "force",
  applyLayout: (simulation, { width, height }) => {
    simulation
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide(30));
  },
};
```

#### 2-3. 레이아웃 레지스트리

```ts
// src/components/features/diagram/layouts/index.ts
import type { DiagramLayout } from "./types";
import { forceLayout } from "./force-layout";
import { timelineLayout } from "./timeline-layout";
import { geographyLayout } from "./geography-layout";

export const LAYOUTS: Record<string, DiagramLayout> = {
  force: forceLayout,
  timeline: timelineLayout,
  geography: geographyLayout,
};

export type LayoutMode = keyof typeof LAYOUTS;
```

#### 2-4. NetworkDiagram 리팩토링

`network-diagram.tsx`에서 레이아웃 분기 로직을 제거하고, 레지스트리에서 레이아웃을 가져와 `applyLayout()`을 호출하는 구조로 변경한다:

```ts
const layoutPlugin = LAYOUTS[layout];
if (layoutPlugin.getNodePosition) {
  // 정적 레이아웃 (simulation 없이 직접 위치 지정)
  nodes.forEach((node) => {
    const pos = layoutPlugin.getNodePosition!(node, context);
    node.x = pos.x;
    node.y = pos.y;
    node.fx = pos.x;
    node.fy = pos.y;
  });
} else {
  // 동적 레이아웃 (simulation 기반)
  layoutPlugin.applyLayout(simulation, context);
}
```

---

### Task 3: Blueprint 모드 (도면풍 그리드)

건축 도면의 미학을 참조한 정적 레이아웃. force simulation을 사용하지 않고 `getNodePosition`으로 노드를 직접 배치한다.

#### 3-1. 레이아웃 로직

- building 노드를 그리드 rows/columns에 정렬 배치
- architect 노드를 건물 그룹 상단 또는 좌측에 배치
- city 노드를 섹션 헤더 위치에 배치
- 정렬 기준: city 그룹 → architect 서브그룹 → building 시간순

#### 3-2. 연결선 스타일

- 직선 대신 직각(orthogonal) 또는 45도 각도 연결선
- `d3.line()` + step interpolation (`d3.curveStep`, `d3.curveStepAfter`)
- 연결선 색상: 기존보다 얇고 정밀한 느낌 (0.5px, 진한 그레이)

#### 3-3. 라벨/번호 체계

- 각 building에 일련번호 부여 (01, 02, 03...)
- 라벨 형식: `01 — Building Name`
- Geist Mono uppercase, letter-spacing 확대
- 범례(legend) 영역에 번호-이름 매핑 표시

#### 3-4. 도면 프레임

- `renderOverlay`로 캔버스 외곽에 이중 보더 프레임 렌더링
- 우하단에 title block: 프로젝트명, 날짜, 노드 수 정보
- 프레임 여백: 상하좌우 60px
- 프레임 선: 1px + 0.5px 이중선, `oklch(0.3 0 0)`

#### 3-5. 전체 미학

- 배경: 순백 또는 미색 (off-white)
- 그리드: 건축 도면의 mm 눈금 느낌 (20px 세밀 그리드 + 100px 주요 그리드)
- 노드: 얇은 외곽선, 최소한의 채움색
- 활자: 정밀하고 기술적인 느낌

---

### Task 4: Poster 모드 (포스터풍 프린트)

인쇄 가능한 포스터를 목표로 한 정적 레이아웃. 큐레이션 결과물을 시각적 아웃풋으로 전환하는 실험.

#### 4-1. 캔버스 설정

- A3 비율(297:420 = 1:1.414) 또는 A4 비율 캔버스
- 컨테이너 내에서 비율 유지하며 fit
- 인쇄 시 의미 있는 해상도 확보 (export pixelRatio: 3 검토)

#### 4-2. 타이포그래피 타이틀

- 캔버스 상단에 대형 타이틀 영역
- "Archi Curation" 또는 큐레이션 셀렉션 이름
- Geist Mono, light weight, 대형 (48-72px 상당)
- 서브타이틀: 선택된 건축물 수, 도시, 날짜

#### 4-3. 건축물 정보 카드 배치

- 각 building을 카드형 요소로 표현 (직사각형 영역)
- 카드 내용: 이름, 건축가, 연도, 도시
- 그리드 레이아웃 (3-4열)
- 카드 간 연결 관계는 얇은 선으로 hint

#### 4-4. 지리적 추상 요소

- 도시 위치를 추상적 좌표로 배치 (작은 점 + 라벨)
- 카드와 도시 점 사이에 미세한 연결선
- 지도 투영이 아닌 추상적 공간 배치

#### 4-5. 큐레이션 캡션 영역

- 캔버스 하단에 캡션/크레딧 영역
- "Curated by Archi Curation" + 날짜
- 작은 범례: 노드 타입 설명

---

### Task 5: LayoutControls 업데이트

#### 5-1. 새 모드 추가

```ts
// layout-controls.tsx — LayoutMode 타입을 layouts/index.ts에서 가져옴
import { LAYOUTS, type LayoutMode } from "./layouts";

// MODES 배열을 레지스트리에서 동적 생성
const MODES = Object.keys(LAYOUTS) as LayoutMode[];
```

#### 5-2. 모드 그룹 구분

- 기존 3개 (Force, Timeline, Geography) → "Analysis" 그룹
- 새로운 2개 (Blueprint, Poster) → "Graphics" 그룹
- 시각적 구분선 (`border-r` 또는 gap) 으로 그룹 분리

#### 5-3. 전환 애니메이션

- 레이아웃 변경 시 노드 위치 전환 애니메이션
- force simulation 기반 → 정적 레이아웃 전환: `d3.transition().duration(500)` 으로 노드 이동
- 정적 → 정적 전환: 동일하게 transition
- 정적 → force 전환: 현재 위치에서 simulation 시작

---

### Task 6: PNG Export 호환성 확인

#### 6-1. 모든 모드에서 export 동작 검증

- Blueprint 모드: 프레임 포함 export
- Poster 모드: A3/A4 비율 유지하여 export
- `html-to-image` 의 `toPng` 이 SVG overlay 요소를 올바르게 캡처하는지 확인

#### 6-2. Export 옵션 확장 (선택)

- Poster 모드에서 pixelRatio: 3 (인쇄 품질)
- 파일명에 레이아웃 모드 포함: `archi-curation-blueprint.png`

---

## Acceptance Criteria

- [ ] 기존 3개 레이아웃(Force, Timeline, Geography) 시각적 개선 적용
- [ ] 라벨에 배경 박스 추가, 가독성 향상
- [ ] 링크 스타일 개선 (곡선 또는 두께/색상 차별화)
- [ ] 레이아웃 플러그인 아키텍처 적용 (`DiagramLayout` interface)
- [ ] 새 레이아웃 추가 시 `layouts/` 디렉토리에 파일 하나 추가 + 레지스트리 등록으로 완료
- [ ] Blueprint 모드 — 도면풍 그리드 배치, 직각 연결선, 프레임, 번호 체계 동작
- [ ] Poster 모드 — A3/A4 비율, 대형 타이틀, 카드형 배치, 캡션 영역 동작
- [ ] LayoutControls에 5개 모드 표시 (Analysis/Graphics 그룹 구분)
- [ ] 레이아웃 전환 시 부드러운 노드 이동 애니메이션
- [ ] PNG export가 모든 5개 모드에서 정상 동작
- [ ] 모든 새 UI 문자열에 i18n 키 사용 (`messages/en.json`, `messages/ko.json`)
- [ ] `npm run build` 성공

---

## Files to Create/Modify

### 신규 생성

| 파일 | 설명 |
|------|------|
| `src/components/features/diagram/layouts/types.ts` | `DiagramLayout` interface, `LayoutContext` type |
| `src/components/features/diagram/layouts/force-layout.ts` | Force 레이아웃 모듈 |
| `src/components/features/diagram/layouts/timeline-layout.ts` | Timeline 레이아웃 모듈 |
| `src/components/features/diagram/layouts/geography-layout.ts` | Geography 레이아웃 모듈 |
| `src/components/features/diagram/layouts/blueprint-layout.ts` | Blueprint 레이아웃 모듈 |
| `src/components/features/diagram/layouts/poster-layout.ts` | Poster 레이아웃 모듈 |
| `src/components/features/diagram/layouts/index.ts` | 레이아웃 레지스트리, `LayoutMode` type export |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/components/features/diagram/network-diagram.tsx` | 레이아웃 분기 제거 → 플러그인 호출, 노드/링크/라벨 스타일 개선, 전환 애니메이션 |
| `src/components/features/diagram/layout-controls.tsx` | `LayoutMode` import 경로 변경, 모드 그룹 구분 UI, 5개 모드 표시 |
| `src/components/features/diagram/diagram-view.tsx` | `LayoutMode` import 경로 변경 |
| `src/components/features/diagram/export-button.tsx` | 레이아웃 모드별 파일명, Poster pixelRatio 조정 (선택) |
| `messages/en.json` | `diagram.layout.blueprint`, `diagram.layout.poster`, 그룹 라벨 키 추가 |
| `messages/ko.json` | 동일 키 한국어 번역 추가 |

---

## i18n Keys (추가분)

```json
{
  "diagram": {
    "layout": {
      "blueprint": "Blueprint",
      "poster": "Poster",
      "groupAnalysis": "Analysis",
      "groupGraphics": "Graphics"
    },
    "blueprint": {
      "titleBlock": "Archi Curation — Diagram",
      "legend": "Legend"
    },
    "poster": {
      "curated": "Curated by Archi Curation",
      "caption": "A curated selection of architectural works"
    }
  }
}
```

---

## Design Direction

Blueprint와 Poster 모드는 **탐색적 프로토타입**이다.

- 완성도보다 **방향성 검증**이 목표
- 유저가 결과물을 평가한 뒤 세부 디자인 방향을 결정
- 프로토타입 단계에서는 하드코딩 스타일 허용 (이후 토큰화)
- 인쇄 품질 최적화는 방향 확정 후 진행

---

## Conventions

이 섹션의 모든 코드는 프로젝트 코딩 컨벤션을 따른다:

- 컴포넌트: `function` 선언식 (`function NetworkDiagram() {}`)
- 유틸리티/레이아웃 모듈: 화살표 함수 또는 객체 리터럴
- Props 정의: `interface` 사용 (`interface NetworkDiagramProps {}`)
- 일반 타입: `type` 사용 (`type LayoutMode = ...`)
- 조건부 렌더링: 삼항 연산자 (`condition ? <A /> : <B />`), `&&` 금지
- UI 문자열: i18n 키 사용 (`t("diagram.layout.blueprint")`), 하드코딩 금지
- Tailwind: 테마 토큰 우선, 하드코딩 색상값 금지
- 파일명: kebab-case (`blueprint-layout.ts`)
- 상수: UPPER_SNAKE_CASE (`NODE_RADIUS`)
- Zustand 셀렉터: 필요한 값만 구독
