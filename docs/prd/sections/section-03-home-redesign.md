# Section 3: Home Page Redesign

> **Priority**: High
> **Dependencies**: section-01 (OptimizedImage)
> **Blocks**: Nothing
> **Status**: Not Started

---

## Background

현재 홈 페이지는 기본적인 히어로 텍스트 + Featured 큐레이션 가로 스크롤 + 4개 진입 카드로 구성되어 있다. 기능적으로는 동작하지만 포트폴리오 수준의 첫인상을 주기에는 부족하다.

사용자가 사이트에 처음 도착했을 때 "건축 큐레이션 프로젝트"라는 정체성을 즉각적으로 전달해야 한다. 이를 위해 홈 페이지를 전면 재디자인한다.

**핵심 방향**:
- 히어로 + 진입점이 사이트의 인상을 결정한다
- Featured/큐레이션 셀렉션은 제거하거나 최소화 — 무엇을 넣을지는 TBD
- 건축적 라인 모션과 타이포그래피가 시각적 주축
- 포트폴리오급 비주얼 퀄리티

---

## Current State

### 파일: `src/app/[locale]/page.tsx`

현재 구조 (180줄):

```
HomePage
├── Hero Section (min-h-[60vh], text-center)
│   ├── subtitle — t("home.subtitle"), tracking-label
│   ├── h1 — "Archi\nCuration", text-4xl~6xl
│   ├── Divider
│   └── description — t("home.description")
├── Featured Curation Section
│   ├── label + "View All" 링크
│   └── 가로 스크롤 featured buildings (w-72 카드 × N)
│       └── 이미지 + year + name + architect
└── Entry Point Cards (2×2 그리드, lg:4열)
    └── Buildings / Architects / Cities / Map
        └── count + title + description + "Explore →"
```

**사용 중인 컴포넌트/유틸리티**:
- `FadeIn`, `StaggerContainer`, `StaggerItem` (framer-motion 래퍼, `src/components/shared/motion-wrapper.tsx`)
- `Divider` (`src/components/ui/divider.tsx`)
- `getBuildings`, `getArchitects`, `getCities`, `getFeaturedBuildings`, `getArchitectById`
- `getArchitectColor`
- `Link` (next-intl navigation)

**사용 중인 i18n 키** (`messages/en.json`, `messages/ko.json`):
- `home.subtitle`, `home.title`, `home.description`
- `home.buildings.title/description`, `home.architects.title/description`
- `home.cities.title/description`, `home.map.title/description`
- `home.featured.label/curation/viewAll`
- `home.explore`

---

## Design System

재디자인은 기존 디자인 시스템 토큰을 엄격히 따른다.

### Color Palette (Achromatic, OKLCh)

모든 색상은 `src/app/globals.css`에 정의된 CSS custom properties를 Tailwind 토큰으로 참조한다. 하드코딩 색상값 사용 금지.

| Token | Tailwind Class | OKLCh Value | 용도 |
|-------|---------------|-------------|------|
| `--background` | `bg-background` | `oklch(1 0 0)` | 페이지 배경 |
| `--foreground` | `text-foreground` | `oklch(0.145 0 0)` | 본문 텍스트 |
| `--muted` | `bg-muted` | `oklch(0.97 0 0)` | 보조 배경 |
| `--muted-foreground` | `text-muted-foreground` | `oklch(0.556 0 0)` | 보조 텍스트 |
| `--border` | `border-border` | `oklch(0.922 0 0)` | 구분선, 테두리 |
| `--accent` | `bg-accent` | `oklch(0.97 0 0)` | 호버 배경 |
| `--primary` | `bg-primary` | `oklch(0.205 0 0)` | 강조 요소 |

### Typography

| 요소 | Font | Weight | Tailwind Classes |
|------|------|--------|-----------------|
| 히어로 타이틀 | Geist Mono | 300 (light) | `font-mono text-4xl sm:text-5xl md:text-6xl font-light tracking-tight` |
| 레이블 | Geist Mono | 400 | `font-mono text-micro tracking-label uppercase` |
| 서브레이블 | Geist Mono | 400 | `font-mono text-micro tracking-sublabel uppercase` |
| 본문 | Geist Mono | 400 | `font-mono text-sm leading-relaxed` |

- **Geist Mono**: 모든 곳에 사용 (`font-mono`)
- **Geist Sans**: 한국어 본문 fallback (`font-sans`)
- **최대 2가지 weight**: `font-light` (300, 타이틀), 기본 400 (본문)
- 커스텀 tracking: `tracking-label` (0.3em), `tracking-sublabel` (0.2em)
- 커스텀 font size: `text-micro` (10px, line-height 1.4)

### Layout Principles

- **Flat**: 그림자 없음 (`shadow-*` 사용 금지)
- **Structure via borders**: `border border-border`로 구조 표현
- **40px grid overlay**: 시각적 정렬 가이드
- **gap-px 패턴**: 카드 사이 1px 간격 (현재 entry points에서 사용 중)

---

## Dependencies

| 방향 | Section | 내용 |
|------|---------|------|
| **Requires** | section-01 (Image Optimization) | `OptimizedImage` 컴포넌트를 히어로/진입점 미리보기에 사용 |
| **Blocks** | - | 다른 섹션을 블로킹하지 않음 |

---

## Implementation Details

### 1. HomeHero 컴포넌트

**파일**: `src/components/features/home/home-hero.tsx`

그리드 기반 히어로 레이아웃으로, 사이트 정체성을 즉각적으로 전달한다.

```
┌─────────────────────────────────────────────────┐
│  [subtitle label]        ← tracking-label       │
│                                                   │
│  Archi                   ← font-light, 6xl       │
│  Curation                                        │
│                                                   │
│  ─────── (divider)                               │
│                                                   │
│  [description]           ← text-muted-foreground │
│                                                   │
│  ╱╲  (line animation — subtle architectural SVG) │
│  ╲╱                                               │
└─────────────────────────────────────────────────┘
```

**구현 사항**:
- `function HomeHero({ subtitle, title, description }: HomeHeroProps)` — function 선언식
- Props는 `interface HomeHeroProps`로 정의
- 그리드 기반 레이아웃 (`grid`, `gap-*`, Tailwind tokens만 사용)
- 타이포그래피 중심: Geist Mono, `font-light`, `tracking-tight`
- `FadeIn` 래퍼로 등장 애니메이션 적용
- 반응형: `min-h-[60vh]` → 모바일에서는 `min-h-[50vh]`, 데스크톱에서 풀 비주얼
- 모든 문자열은 i18n 키로 props 전달 (하드코딩 금지)

**i18n 키** (기존 활용 + 필요 시 추가):
- `home.subtitle`, `home.title`, `home.description`
- 추가 필요 시: `home.hero.tagline` 등

### 2. Entry Points 컴포넌트

**파일**: `src/components/features/home/home-entry-points.tsx`

Map, Buildings, Architects, Cities 4개 진입점을 제공한다.

```
┌──────────┬──────────┬──────────┬──────────┐
│ 04       │ 03       │ 02       │ —        │
│ Buildings│ Architects│ Cities  │ Map      │
│ desc...  │ desc...  │ desc... │ desc...  │
│          │          │         │          │
│ Explore →│ Explore →│Explore →│Explore → │
└──────────┴──────────┴──────────┴──────────┘
```

**구현 사항**:
- `function HomeEntryPoints({ items }: HomeEntryPointsProps)` — function 선언식
- `interface HomeEntryPointItem` — title, description, href, count 필드
- `interface HomeEntryPointsProps` — `{ items: HomeEntryPointItem[] }`
- `StaggerContainer` + `StaggerItem`으로 순차 등장
- 기존 `gap-px` + `border border-border` 패턴 유지
- 반응형 그리드: `grid sm:grid-cols-2 lg:grid-cols-4`
- 각 카드에 count 표시 (`getBuildings().length` 등)
- 호버: `hover:bg-accent` (현재 패턴 유지), 추가로 건축적 느낌의 subtle interaction 탐색
  - 예: 호버 시 border color 변화, 또는 내부 요소 미세 이동 (`translate-y-px`)
  - CSS `transition-all` 사용, JS 애니메이션 불필요
- 조건부 렌더링은 삼항 연산자만 사용 (`&&` 금지)

**i18n 키** (기존 활용):
- `home.buildings.title/description`
- `home.architects.title/description`
- `home.cities.title/description`
- `home.map.title/description`
- `home.explore`

### 3. Line Animation 컴포넌트

**파일**: `src/components/features/home/line-animation.tsx`

건축적 라인 드로잉 애니메이션. 히어로 영역에 시각적 깊이를 더한다.

**구현 사항**:
- `function LineAnimation({ className }: LineAnimationProps)` — function 선언식
- SVG 기반: `<svg>` 내부에 `<path>` 요소들
- 얇은 선 (stroke-width: 0.5~1px), `stroke` 색상은 `currentColor` 또는 `var(--border)` 사용
- 그리드/건축 도면 느낌: 직선, 직각, 45도 각도
- **CSS animation 우선** (JS 불필요):
  ```css
  @keyframes draw-line {
    from { stroke-dashoffset: <length>; }
    to { stroke-dashoffset: 0; }
  }
  ```
  - `stroke-dasharray` + `stroke-dashoffset` + CSS `animation`으로 path drawing 효과
- 성능: `will-change: stroke-dashoffset`, `animation-fill-mode: forwards`
- 반복 없음 — 한 번 그려지고 정지
- `"use client"` 필요 (CSS animation 자체는 서버 렌더 가능하나, 필요 시 viewport 진입 트리거를 위해)
- 반응형: SVG `viewBox` + `preserveAspectRatio`로 대응, 모바일에서는 간소화 또는 숨김 가능

### 4. Overall Scroll Experience

**페이지 구성**: `src/app/[locale]/page.tsx` (major rewrite)

```
┌─────────────────────────────────┐
│          HomeHero                │  ← min-h-[60vh]
│   (title + line animation)      │
├─────────────────────────────────┤
│       HomeEntryPoints           │  ← 4-column grid
│   (Buildings/Architects/        │
│    Cities/Map)                  │
├─────────────────────────────────┤
│       [Optional: TBD Section]   │  ← Featured 제거/최소화
│                                 │     무엇을 넣을지 미정
└─────────────────────────────────┘
```

**구현 사항**:
- `FadeIn` 래퍼로 섹션 간 부드러운 등장 전환 (기존 motion-wrapper 패턴)
- 추후 `whileInView` 기반 scroll-triggered animation 도입 가능 (Framer Motion)
- Mobile responsive: `sm:`, `md:`, `lg:` breakpoints (mobile-first)
- Featured 큐레이션 섹션은 이번 구현에서 제거 또는 플레이스홀더로 최소화
  - 향후 무엇을 넣을지는 디자인 과정에서 결정
  - `home-featured.tsx`는 optional — 필요 시에만 생성

### 5. Home Content 전략

| 영역 | 상태 | 설명 |
|------|------|------|
| Hero | **Core** | 반드시 구현. 사이트 정체성 전달의 핵심 |
| Entry Points | **Core** | 반드시 구현. 4개 진입점 + 데이터 프리뷰 |
| Featured Section | **Optional/TBD** | 기존 가로 스크롤 featured buildings는 제거 또는 최소화. 대체 콘텐츠는 미정 |

---

## Acceptance Criteria

- [ ] `HomeHero` 컴포넌트가 그리드 기반 레이아웃으로 사이트 성격을 전달한다
- [ ] 건축적 라인 모션(`LineAnimation`)이 부드럽고 자연스럽다
- [ ] CSS animation 기반으로 성능 이슈 없다 (JS animation 미사용)
- [ ] `HomeEntryPoints`가 4개 진입점(Buildings, Architects, Cities, Map)을 제공한다
- [ ] 각 진입점에 데이터 count가 표시된다
- [ ] 호버 인터랙션이 건축적 느낌으로 subtle하게 동작한다
- [ ] 모바일 반응형: `sm:`, `md:`, `lg:` breakpoints에서 레이아웃이 적절히 변환된다
- [ ] EN/KO 양언어 지원 — 모든 문자열이 i18n 키 사용
- [ ] Tailwind 디자인 토큰만 사용 — 하드코딩 색상값 없음
- [ ] Geist Mono 기반 타이포그래피, 최대 2가지 weight (light + 400)
- [ ] 그림자 없음 — border로만 구조 표현
- [ ] Featured 섹션은 제거 또는 최소화된 상태
- [ ] Lighthouse Performance 90+ 유지
- [ ] `npm run build` 성공

---

## Files to Create / Modify

### New Files

| File | Description |
|------|------------|
| `src/components/features/home/home-hero.tsx` | 그리드 기반 히어로 컴포넌트 |
| `src/components/features/home/home-entry-points.tsx` | 4개 진입점 그리드 컴포넌트 |
| `src/components/features/home/line-animation.tsx` | SVG 건축적 라인 드로잉 애니메이션 |
| `src/components/features/home/home-featured.tsx` | (optional) Featured 섹션 — 필요 시에만 |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/[locale]/page.tsx` | Major rewrite — 새 컴포넌트 조합으로 교체 |
| `messages/en.json` | 홈 관련 i18n 키 추가/수정 (필요 시) |
| `messages/ko.json` | 홈 관련 i18n 키 추가/수정 (필요 시) |

---

## Conventions Checklist

이 섹션의 모든 코드는 아래 컨벤션을 따른다 (`.claude/rules/coding-conventions.md` 기준):

- [ ] 컴포넌트는 `function` 선언식 사용 (화살표 함수 X)
- [ ] Props는 `interface`로 정의
- [ ] 조건부 렌더링은 삼항 연산자만 사용 (`&&` 금지)
- [ ] `<button>`에 `type` 속성 명시
- [ ] UI 문자열은 반드시 `t("key")` 번역 키 사용 (하드코딩 금지)
- [ ] Tailwind 테마 토큰 사용 — 하드코딩 색상값(`#fff`, `rgb(...)`) 금지
- [ ] `cn()` 유틸리티로 조건부 클래스 조합
- [ ] Zustand 스토어 사용 시 셀렉터로 필요한 값만 구독
- [ ] 컴포넌트 파일 300줄 이내
- [ ] JSX return 100줄 이내
- [ ] 파일명 kebab-case, 컴포넌트명 PascalCase
