# Archi Curation Phase 2+3 — Ralph Loop Execution Prompt

## Mission

Archi Curation Phase 2+3를 자율적으로 구현한다. 건축 큐레이션 웹 애플리케이션(Next.js 16 App Router + React 19 + TypeScript 5 + Tailwind CSS 4 + MapLibre GL + D3.js)에 6개 섹션의 기능을 순차적으로 구현하고, 모든 섹션이 완료되면 `<promise>ALL-SECTIONS-COMPLETE</promise>`를 반환한다.

---

## Execution Order & Dependency Graph

<!-- SECTION_MANIFEST
section-01-image-optimization
section-02-map-enhancement
section-03-home-redesign
section-04-shops-events
section-05-diagram-enhancement
section-06-data-pipeline
END_MANIFEST -->

### Dependency Graph

| Section | Depends On | Blocks | Parallelizable |
|---------|------------|--------|----------------|
| section-01-image-optimization | - | 03, 04 | Yes |
| section-02-map-enhancement | - | 04 | Yes |
| section-03-home-redesign | 01 | - | No |
| section-04-shops-events | 01, 02 | 06 | No |
| section-05-diagram-enhancement | - | - | Yes |
| section-06-data-pipeline | 04 | - | No |

### Execution Order

1. **Wave 1** (병렬): section-01-image-optimization, section-02-map-enhancement, section-05-diagram-enhancement
2. **Wave 2**: section-03-home-redesign (01 완료 후)
3. **Wave 3**: section-04-shops-events (01 + 02 완료 후)
4. **Wave 4**: section-06-data-pipeline (04 완료 후)

### Section Summaries

- **section-01-image-optimization**: Next.js Image 컴포넌트 래퍼(OptimizedImage) 생성, 기존 컴포넌트 마이그레이션, ImageMeta 타입에 width/height 추가. 레이아웃 시프트(CLS) 완전 제거 목표.
- **section-02-map-enhancement**: 지도 필터링 UI (도시 드롭다운 + 태그 칩) 추가, DOM 마커를 MapLibre GL symbol layer + 클러스터링으로 마이그레이션. 50개+ 마커 성능 대응.
- **section-03-home-redesign**: 홈 페이지 전면 재디자인. 그리드 기반 히어로 + 건축적 라인 모션 + 진입점 재구성. 포트폴리오적 인상. Featured 섹션은 선택 사항.
- **section-04-shops-events**: Shops/Events 기본 UI 구축. 시드 데이터 생성, 리스트/상세 페이지, 네비게이션 추가, 지도에 마커 통합.
- **section-05-diagram-enhancement**: 기존 다이어그램 디자인 폴리시 + 레이아웃 아키텍처 리팩토링 + Blueprint(도면풍) 및 Poster(포스터풍) 2차 그래픽 전환 모드 프로토타입.
- **section-06-data-pipeline**: JSON → Google Sheets 마이그레이션 경로 준비. 스키마 매핑 문서, CSV→JSON 변환 스크립트, 데이터 검증 유틸리티, GitHub Actions 워크플로우 템플릿.

---

## Section 01: Image Optimization Foundation

### Background

이 섹션은 프로젝트 전체의 이미지 성능 기반을 구축한다. 현재 프로젝트의 모든 이미지는 네이티브 `<img>` 태그를 사용하고 있어 다음과 같은 문제가 발생한다:

- **Cumulative Layout Shift (CLS)**: 이미지 로드 전 공간이 확보되지 않아 레이아웃이 밀리는 현상
- **최적화 부재**: Next.js Image 컴포넌트의 자동 포맷 변환(WebP/AVIF), lazy loading, srcset 생성 기능을 활용하지 않음
- **로딩 경험 부재**: 이미지 로드 전 빈 공간만 표시되어 사용자에게 불완전한 인상을 줌

이 섹션은 다른 모든 이미지 관련 섹션(Section 3: Home Redesign, Section 4: Shops/Events)의 기반이 되므로 가장 먼저 완료해야 한다.

### Current State

프로젝트 내 이미지를 렌더링하는 파일 4곳 모두 네이티브 `<img>` 태그를 사용하고 있다:

| 파일 | 용도 | 현재 방식 |
|------|------|-----------|
| `src/components/features/buildings/building-grid-card.tsx` | 건물 그리드 카드 썸네일 | `<img>` + `loading="lazy"` + `aspect-[4/3]` 컨테이너 |
| `src/app/[locale]/map/buildings/[slug]/page.tsx` | 건물 상세 메인 이미지 | `<img>` + `loading="lazy"`, 크기 제약 없음 |
| `src/app/[locale]/page.tsx` | 홈 페이지 이미지 | `<img>` 사용 |
| `src/components/features/map/building-popup.tsx` | 지도 팝업 이미지 | `<img>` 사용 |

모든 곳에서 `eslint-disable-next-line @next/next/no-img-element` 주석으로 ESLint 경고를 억제하고 있다.

### ImageMeta 타입

`src/types/common.ts`에 정의된 현재 ImageMeta:

```typescript
export interface ImageMeta {
  src: string;
  alt: string;
  width?: number;   // 이미 optional로 존재하지만 실제 데이터에서 사용하지 않음
  height?: number;  // 이미 optional로 존재하지만 실제 데이터에서 사용하지 않음
  credit?: string;
}
```

타입에는 `width`/`height` 필드가 이미 optional로 선언되어 있지만, 실제 JSON 데이터에는 값이 채워져 있지 않다.

### 사용 중인 엔티티

`src/types/entities.ts`에서 ImageMeta를 사용하는 타입:
- `Building.images: ImageMeta[]`
- `Architect.portrait?: ImageMeta`
- `City.images: ImageMeta[]`
- `Shop.images: ImageMeta[]`
- `Event.images: ImageMeta[]`

### Dependencies

| 방향 | 대상 | 설명 |
|------|------|------|
| **requires** | 없음 | 독립적으로 착수 가능 |
| **blocks** | Section 3 (Home Redesign) | 홈 히어로 이미지가 OptimizedImage 사용 |
| **blocks** | Section 4 (Shops/Events) | Shop/Event 카드 이미지가 OptimizedImage 사용 |

### Requirements

완료 시 다음 조건이 모두 충족되어야 한다:

1. 모든 이미지 렌더링이 Next.js `<Image>` 컴포넌트를 통해 이루어진다
2. 이미지 로드 전 Skeleton placeholder가 표시된다
3. CLS(Cumulative Layout Shift)가 0이다
4. 반응형 `sizes` prop이 모든 이미지에 적용된다
5. `eslint-disable @next/next/no-img-element` 주석이 제거된다
6. 기존 시각적 디자인이 유지된다 (레이아웃, 호버 효과 등)

### Implementation Details

#### Task 1: OptimizedImage 컴포넌트 생성

**파일**: `src/components/shared/optimized-image.tsx` (신규)

Next.js `<Image>`를 감싸는 프로젝트 전용 래퍼 컴포넌트를 생성한다.

##### Props 인터페이스

```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  blurDataURL?: string;
  aspectRatio?: string; // e.g. "4/3", "16/9"
}
```

- `interface` 키워드로 Props 정의 (코딩 컨벤션)
- 컴포넌트는 `function` 선언식으로 작성 (코딩 컨벤션)

##### 핵심 동작

1. **fill 모드 vs fixed 모드 분기**:
   - `fill={true}` 또는 `width`/`height` 미제공 시: `<Image fill>` 사용, 부모 컨테이너가 크기 결정
   - `width`/`height` 제공 시: 고정 크기 `<Image>` 사용

2. **Skeleton 로딩 상태**:
   - `useState`로 `isLoaded` 상태 관리
   - 로드 전: `animate-pulse bg-muted` 클래스로 Skeleton 표시
   - `<Image onLoad>` 콜백에서 `isLoaded = true`로 전환
   - 조건부 렌더링은 삼항 연산자 사용 (코딩 컨벤션: `&&` 금지)

3. **Blur placeholder 지원**:
   - `blurDataURL` prop 전달 시 `placeholder="blur"` 자동 적용
   - blur와 skeleton을 동시에 사용하지 않음 (blurDataURL이 있으면 skeleton 비활성)

4. **aspect-ratio CSS fallback**:
   - `aspectRatio` prop 제공 시 컨테이너에 `style={{ aspectRatio }}` 적용
   - fill 모드에서 `position: relative` + `overflow: hidden` 컨테이너 자동 생성
   - width/height가 알려진 경우에도 CLS 방지를 위해 aspect-ratio 적용

5. **sizes 기본값**:
   - `sizes` prop 미제공 시 기본값: `"100vw"`
   - 각 사용처에서 적절한 sizes를 명시적으로 전달하는 것을 권장

##### 구현 예시

```typescript
"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  blurDataURL?: string;
  aspectRatio?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes = "100vw",
  priority = false,
  className,
  fill,
  blurDataURL,
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const useFill = fill || (!width && !height);
  const showSkeleton = !blurDataURL;

  const imageElement = (
    <Image
      src={src}
      alt={alt}
      width={useFill ? undefined : width}
      height={useFill ? undefined : height}
      fill={useFill}
      sizes={sizes}
      priority={priority}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        useFill ? "object-cover" : undefined,
        className,
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );

  // fill 모드: 컨테이너가 필요
  return useFill ? (
    <div
      className="relative overflow-hidden"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {showSkeleton ? (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-muted transition-opacity duration-300",
            isLoaded ? "opacity-0" : "opacity-100",
          )}
        />
      ) : null}
      {imageElement}
    </div>
  ) : (
    <div className="relative" style={aspectRatio ? { aspectRatio } : undefined}>
      {showSkeleton ? (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-muted transition-opacity duration-300",
            isLoaded ? "opacity-0" : "opacity-100",
          )}
        />
      ) : null}
      {imageElement}
    </div>
  );
}
```

##### 주의사항

- `"use client"` 필수 (useState 사용)
- Tailwind 테마 토큰만 사용: `bg-muted`, `animate-pulse` (하드코딩 색상 금지)
- `cn()` 유틸리티로 클래스 조합 (`@/lib/utils`에서 import)
- 파일명: `optimized-image.tsx` (kebab-case 컨벤션)
- 컴포넌트명: `OptimizedImage` (PascalCase 컨벤션)

#### Task 2: ImageMeta 타입 확인 및 데이터 보강

**파일**: `src/types/common.ts` (확인), `src/lib/data/*.json` (수정)

##### 타입 상태

`ImageMeta`에 `width`/`height`가 이미 optional로 선언되어 있으므로 타입 자체는 변경 불필요:

```typescript
// src/types/common.ts — 현재 상태 유지
export interface ImageMeta {
  src: string;
  alt: string;
  width?: number;   // 이미 존재
  height?: number;  // 이미 존재
  credit?: string;
}
```

##### JSON 데이터 보강

실제 JSON 데이터 파일에서 각 이미지 항목에 `width`/`height` 값을 추가한다.

수정 대상 파일:
- `src/lib/data/buildings.json` — 모든 building의 `images` 배열 내 항목
- `src/lib/data/architects.json` — `portrait` 항목
- `src/lib/data/cities.json` — 모든 city의 `images` 배열 내 항목

각 이미지의 실제 픽셀 크기를 확인하여 입력한다. 이미지가 외부 URL인 경우 원본 비율을 기준으로 표준 크기를 사용한다 (예: 1600x1200, 800x800 등).

> **점진적 마이그레이션**: width/height가 optional이므로 값이 없는 이미지도 동작에 문제없다. OptimizedImage는 width/height 부재 시 fill 모드로 fallback한다.

#### Task 3: 기존 컴포넌트 마이그레이션

각 컴포넌트에서 `<img>` 태그를 `<OptimizedImage>`로 교체한다.

##### 3-1. BuildingGridCard (건물 그리드 카드 썸네일)

**파일**: `src/components/features/buildings/building-grid-card.tsx`

현재 코드:
```tsx
{building.images[0]?.src ? (
  <div className="aspect-[4/3] overflow-hidden">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={building.images[0].src}
      alt={building.images[0].alt}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
    />
  </div>
) : ( ... )}
```

변경 후:
```tsx
import { OptimizedImage } from "@/components/shared/optimized-image";

// JSX 내부:
{building.images[0]?.src ? (
  <OptimizedImage
    src={building.images[0].src}
    alt={building.images[0].alt}
    fill
    aspectRatio="4/3"
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    className="transition-transform duration-300 group-hover:scale-105"
  />
) : ( ... )}
```

- `eslint-disable` 주석 제거
- `aspect-[4/3]` div 제거 → `aspectRatio="4/3"` prop으로 대체
- `sizes`: 그리드 컬럼 수 기반 계산 (2col sm / 3col md / 4col lg)

##### 3-2. BuildingDetailPage (건물 상세 메인 이미지)

**파일**: `src/app/[locale]/map/buildings/[slug]/page.tsx`

현재 코드:
```tsx
{building.images[0]?.src && (
  <div className="mb-8 overflow-hidden border border-border">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={building.images[0].src}
      alt={building.images[0].alt}
      className="w-full object-cover"
      loading="lazy"
    />
  </div>
)}
```

변경 후:
```tsx
import { OptimizedImage } from "@/components/shared/optimized-image";

// JSX 내부:
{building.images[0]?.src ? (
  <div className="mb-8 overflow-hidden border border-border">
    <OptimizedImage
      src={building.images[0].src}
      alt={building.images[0].alt}
      fill
      aspectRatio="16/9"
      sizes="(max-width: 672px) 100vw, 672px"
      priority
    />
  </div>
) : null}
```

- `&&` 조건부 렌더링 → 삼항 연산자로 변경 (코딩 컨벤션)
- `priority` 적용: 상세 페이지 메인 이미지는 LCP(Largest Contentful Paint) 대상
- `sizes`: max-w-2xl(672px) 컨테이너 기준

##### 3-3. BuildingPopup (지도 팝업 이미지)

**파일**: `src/components/features/map/building-popup.tsx`

팝업 내부의 `<img>`를 `<OptimizedImage>`로 교체:

```tsx
import { OptimizedImage } from "@/components/shared/optimized-image";

// 팝업 이미지:
<OptimizedImage
  src={image.src}
  alt={image.alt}
  fill
  aspectRatio="16/9"
  sizes="280px"
/>
```

- 팝업은 고정 너비이므로 sizes는 픽셀 값으로 지정

##### 3-4. HomePage (홈 페이지 이미지)

**파일**: `src/app/[locale]/page.tsx`

홈 페이지의 모든 `<img>` 태그를 `<OptimizedImage>`로 교체. 각 이미지의 컨텍스트에 맞는 sizes와 priority를 설정한다.

> 홈 페이지는 Section 3에서 전면 재디자인 예정이므로, 이 단계에서는 기존 이미지만 OptimizedImage로 전환하되 레이아웃은 변경하지 않는다.

#### Task 4: 반응형 sizes prop 가이드

각 사용처별 `sizes` 값 참고표:

| 컴포넌트 | 레이아웃 | sizes 값 |
|----------|---------|----------|
| BuildingGridCard | 2col(sm) / 3col(md) / 4col(lg) | `"(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"` |
| BuildingDetailPage | 단일 컬럼 max-w-2xl | `"(max-width: 672px) 100vw, 672px"` |
| BuildingPopup | 고정 너비 팝업 | `"280px"` |
| ArchitectPortrait (향후) | 리스트 카드 내 | `"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` |
| CityImage (향후) | 리스트 카드 내 | `"(max-width: 640px) 100vw, 50vw"` |

#### Task 5: next.config 이미지 도메인 설정

외부 이미지 URL을 사용하는 경우 `next.config.ts`에 이미지 도메인을 등록해야 한다.

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      // 실제 사용 중인 이미지 호스트 도메인 추가
      // 예:
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};
```

실제 JSON 데이터의 이미지 `src` 필드를 확인하여 해당 도메인을 모두 등록한다. 로컬 이미지(`/images/...`)만 사용하는 경우 이 설정은 불필요하다.

### Acceptance Criteria

- [ ] `OptimizedImage` 컴포넌트가 `src/components/shared/optimized-image.tsx`에 존재한다
- [ ] `OptimizedImage`가 Next.js `<Image>` 컴포넌트를 사용한다
- [ ] 이미지 로드 전 Skeleton placeholder(animate-pulse)가 표시된다
- [ ] blurDataURL 전달 시 blur placeholder가 동작한다
- [ ] fill 모드에서 aspectRatio prop이 컨테이너에 적용된다
- [ ] 프로젝트 내 모든 `<img>` 태그가 `<OptimizedImage>`로 교체된다
- [ ] `eslint-disable @next/next/no-img-element` 주석이 모두 제거된다
- [ ] 모든 이미지에 적절한 `sizes` prop이 적용된다
- [ ] 상세 페이지 메인 이미지에 `priority` 가 적용된다
- [ ] 모든 페이지에서 CLS(Cumulative Layout Shift) = 0
- [ ] 기존 시각적 디자인(레이아웃, 호버 효과, 비율)이 유지된다
- [ ] `npm run build` 성공
- [ ] Lighthouse Performance 90+

### Files to Create/Modify

**신규 생성:**

| 파일 경로 | 설명 |
|-----------|------|
| `src/components/shared/optimized-image.tsx` | OptimizedImage 래퍼 컴포넌트 |

**수정:**

| 파일 경로 | 변경 내용 |
|-----------|-----------|
| `src/components/features/buildings/building-grid-card.tsx` | `<img>` → `<OptimizedImage>`, eslint-disable 제거 |
| `src/app/[locale]/map/buildings/[slug]/page.tsx` | `<img>` → `<OptimizedImage>`, `&&` → 삼항, priority 추가 |
| `src/components/features/map/building-popup.tsx` | `<img>` → `<OptimizedImage>` |
| `src/app/[locale]/page.tsx` | `<img>` → `<OptimizedImage>` |
| `src/lib/data/buildings.json` | 이미지 항목에 width/height 값 추가 |
| `src/lib/data/architects.json` | portrait에 width/height 값 추가 |
| `src/lib/data/cities.json` | 이미지 항목에 width/height 값 추가 |
| `next.config.ts` | 외부 이미지 도메인 등록 (필요 시) |

**변경 불필요:**

| 파일 경로 | 이유 |
|-----------|------|
| `src/types/common.ts` | ImageMeta에 width/height가 이미 optional로 존재 |
| `src/types/entities.ts` | 타입 변경 없음 |

---

## Section 02: Map Enhancement — Filtering + Clustering

### Background

현재 지도 페이지(`/map`)는 필터 UI가 없고, DOM 기반 `<Marker>` 컴포넌트를 사용하여 건축물을 표시한다. 건축물 수가 50개 이상으로 늘어나면 DOM 마커의 렌더링 비용이 급격히 증가하고, 밀집 지역에서 마커가 겹쳐 사용성이 떨어진다.

이 섹션에서는 두 가지를 해결한다:

1. **필터링 UI** — 도시/태그로 지도 위 건축물을 필터링하는 인터페이스
2. **Symbol Layer + Clustering** — DOM 마커를 MapLibre GL 네이티브 레이어로 마이그레이션하고 클러스터링 적용

### Current State

**기술 스택:**
- MapLibre GL JS 5.22 + react-map-gl 8.1
- OpenFreeMap Liberty 타일 (`https://tiles.openfreemap.org/styles/liberty`)

**기존 컴포넌트 구조:**

| 컴포넌트 | 파일 경로 | 역할 |
|----------|----------|------|
| `MapView` | `src/components/features/map/map-view.tsx` | 지도 렌더링, DOM 마커 순회, 필터 적용 |
| `BuildingMarker` | `src/components/features/map/building-marker.tsx` | react-map-gl `<Marker>` 기반 DOM 마커. 건축가 색상 원형, 선택 시 ping 애니메이션 |
| `BuildingPopup` | `src/components/features/map/building-popup.tsx` | 마커 클릭 시 건축물 정보 팝업 |
| `ArchitectLegend` | `src/components/features/map/architect-legend.tsx` | 건축가별 색상 범례 (좌측 사이드바) |
| `SelectionSidebar` | `src/components/features/map/selection-sidebar.tsx` | 선택된 건축물 목록 (우측 패널, 최대 10개) |
| `MapFilters` | `src/components/features/map/map-filters.tsx` | 기존 필터 UI (Zustand `map-filter-store` 기반, 도시/태그 토글) |

**현재 한계:**

- **MapFilters 존재하나 URL 상태 미연동** — 필터 상태가 Zustand 스토어에만 저장되어 공유 불가
- **DOM 마커 성능** — `BuildingMarker`가 개별 React 컴포넌트로 렌더링되어 50개+ 시 성능 저하
- **클러스터링 없음** — 밀집 지역에서 마커 겹침, 줌 레벨별 자동 그룹화 부재
- **하드코딩 문자열** — MapFilters 내 "Filters", "City", "Tag / Style", "Clear Filters" 등이 i18n 키 미사용

### Requirements

**Part A — Map Filter UI 개선:** MapFilters 컴포넌트를 확장하여 URL 기반 상태 관리와 i18n을 적용한다.

**Part B — Symbol Layer + Clustering:** DOM 마커를 MapLibre GL 네이티브 GeoJSON 소스 + 레이어로 마이그레이션하고 클러스터링을 구현한다.

### Implementation Details

#### Part A — Map Filter UI

##### A-1. MapFilter 컴포넌트 리팩토링

기존 `map-filters.tsx`를 `map-filter.tsx`로 리네이밍하고 다음을 적용한다:

**파일**: `src/components/features/map/map-filter.tsx`

```tsx
interface MapFilterProps {
  cities: City[];
  tags: Tag[];
}

function MapFilter({ cities, tags }: MapFilterProps) {
  // 도시 드롭다운 (cities 데이터 기반)
  // 태그 칩 필터 (getAllTags() 기반)
  // 활성 필터 표시 + 초기화 버튼
  // 지도 상단 오버레이 배치
}
```

**UI 구성:**
- 도시 필터: 드롭다운 셀렉트 (현재 칩 방식에서 변경 — 도시 수 증가 대비)
- 태그 필터: 수평 칩 토글 (현행 유지)
- 활성 필터 영역: 선택된 필터를 작은 칩으로 표시, 개별 제거 가능
- 전체 초기화 버튼: 모든 필터 해제

**i18n 키:**
```json
{
  "map.filter.title": "Filters",
  "map.filter.city": "City",
  "map.filter.tag": "Tag / Style",
  "map.filter.clear": "Clear Filters",
  "map.filter.active_count": "{count} active"
}
```

##### A-2. 필터 상태 → URL Search Params

필터 상태를 URL search params로 관리하여 공유 가능하게 만든다.

```
/map?city=seoul,tokyo&tag=brutalism,minimalism
```

**구현 방식:**
- `useSearchParams()` + `useRouter()`로 URL 읽기/쓰기
- Zustand 스토어를 URL과 양방향 동기화 (스토어는 캐시 역할)
- 초기 로드 시 URL params → 스토어 hydration
- 필터 변경 시 `router.replace()` (히스토리 누적 방지)

**파일**: `src/lib/stores/map-filter-store.ts` 수정
- `syncFromUrl(params: URLSearchParams)` 액션 추가
- `toSearchParams(): URLSearchParams` 셀렉터 추가

##### A-3. 필터 적용 → GeoJSON 소스 업데이트

필터 변경 시 GeoJSON 소스의 데이터를 교체하여 마커를 업데이트한다.

- 필터된 buildings 배열 → FeatureCollection 변환
- `map.getSource('buildings').setData(filteredGeoJSON)` 호출
- 소스 데이터 교체는 MapLibre가 자동으로 부드럽게 처리

#### Part B — Symbol Layer + Clustering

##### B-1. GeoJSON 소스 + 레이어 구성

DOM 마커(`BuildingMarker`)를 MapLibre GL 네이티브 레이어로 교체한다.

**GeoJSON Source 생성:**
```tsx
<Source
  id="buildings"
  type="geojson"
  data={buildingsFeatureCollection}
  cluster={true}
  clusterRadius={50}
  clusterMaxZoom={14}
>
  {/* 레이어들 */}
</Source>
```

**FeatureCollection 변환 함수:**

**파일**: `src/lib/map/buildings-to-geojson.ts` (신규)

```tsx
interface BuildingFeatureProperties {
  id: string;
  name: string;
  slug: string;
  architectId: string;
  architectColor: string;
  cityId: string;
  tags: string[];  // tag slugs
}

const buildingsToFeatureCollection = (
  buildings: Building[]
): GeoJSON.FeatureCollection<GeoJSON.Point> => {
  return {
    type: "FeatureCollection",
    features: buildings.map((b) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [b.location.lng, b.location.lat],
      },
      properties: {
        id: b.id,
        name: b.name,
        slug: b.slug,
        architectId: b.architectId,
        architectColor: getArchitectColor(b.architectId),
        cityId: b.cityId,
        tags: b.tags.map((t) => t.slug),
      },
    })),
  };
};
```

**레이어 구성** (3개 레이어):

1. **Cluster Circle Layer** (`clusters`):
   - `filter: ["has", "point_count"]`
   - 원형, 크기는 point_count에 따라 단계적 증가
   - 색상: `var(--muted-foreground)` 계열 (중립)

2. **Cluster Count Symbol Layer** (`cluster-count`):
   - `filter: ["has", "point_count"]`
   - `text-field: ["get", "point_count_abbreviated"]`
   - 클러스터 원 위에 숫자 표시

3. **Unclustered Point Circle Layer** (`unclustered-point`):
   - `filter: ["!", ["has", "point_count"]]`
   - `circle-color: ["get", "architectColor"]` — 건축가별 색상 매핑
   - `circle-radius`: 기본 5px, 선택 시 7px
   - `circle-stroke-width: 2`, `circle-stroke-color: var(--background)`

```tsx
<Layer
  id="clusters"
  type="circle"
  source="buildings"
  filter={["has", "point_count"]}
  paint={{
    "circle-color": "hsl(0, 0%, 60%)",
    "circle-radius": [
      "step", ["get", "point_count"],
      15,   // default
      10, 20,   // 10개 이상 → 20px
      30, 25,   // 30개 이상 → 25px
    ],
  }}
/>

<Layer
  id="cluster-count"
  type="symbol"
  source="buildings"
  filter={["has", "point_count"]}
  layout={{
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 11,
    "text-font": ["Open Sans Bold"],
  }}
  paint={{
    "text-color": "hsl(0, 0%, 100%)",
  }}
/>

<Layer
  id="unclustered-point"
  type="circle"
  source="buildings"
  filter={["!", ["has", "point_count"]]}
  paint={{
    "circle-color": ["get", "architectColor"],
    "circle-radius": 5,
    "circle-stroke-width": 2,
    "circle-stroke-color": "hsl(0, 0%, 100%)",
  }}
/>
```

##### B-2. 클러스터 인터랙션

**클러스터 클릭 → 줌 인:**
```tsx
const handleClusterClick = useCallback(async (e: MapLayerMouseEvent) => {
  const features = e.features;
  if (!features?.length) return;

  const clusterId = features[0].properties?.cluster_id;
  const source = mapRef.current?.getSource("buildings") as GeoJSONSource;

  const zoom = await source.getClusterExpansionZoom(clusterId);
  mapRef.current?.flyTo({
    center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
    zoom,
    duration: 500,
  });
}, []);
```

**개별 마커 클릭 → 팝업 + 선택:**
```tsx
const handlePointClick = useCallback((e: MapLayerMouseEvent) => {
  const feature = e.features?.[0];
  if (!feature) return;

  const buildingId = feature.properties?.id;
  const building = buildings.find((b) => b.id === buildingId);
  if (!building) return;

  setPopupBuilding(building);
  mapRef.current?.flyTo({
    center: [building.location.lng, building.location.lat],
    zoom: 12,
    duration: 800,
  });
}, [buildings]);
```

**이벤트 등록** (Map 컴포넌트에):
```tsx
<Map
  interactiveLayerIds={["clusters", "unclustered-point"]}
  onClick={handleMapClick}
  onMouseEnter={handleMouseEnter}   // cursor: pointer
  onMouseLeave={handleMouseLeave}   // cursor: default
>
```

##### B-3. 선택 상태 시각화

DOM 마커에서 사용하던 선택 상태(ping 애니메이션)를 레이어 기반으로 전환한다.

- 선택된 building ID 목록을 `paint` 표현식에 반영
- `circle-radius`: 선택 시 7px, 미선택 시 5px
- `circle-stroke-width`: 선택 시 3px로 강조

```tsx
paint={{
  "circle-radius": [
    "case",
    ["in", ["get", "id"], ["literal", selectedBuildingIds]],
    7,
    5,
  ],
  "circle-stroke-width": [
    "case",
    ["in", ["get", "id"], ["literal", selectedBuildingIds]],
    3,
    2,
  ],
}}
```

> **참고**: MapLibre GL 표현식에서 동적 배열 비교가 제한적일 수 있으므로, `filter` 기반 별도 하이라이트 레이어(`selected-point`)를 추가하는 대안도 고려한다.

##### B-4. ArchitectLegend 동기화

`ArchitectLegend`의 색상이 symbol layer의 `circle-color`와 동일한 색상 매핑(`getArchitectColor`)을 사용하도록 확인한다.

- 기존 `getArchitectColor()` 함수가 이미 양쪽에서 공유 가능
- 레전드 항목 호버 시 해당 건축가의 마커만 하이라이트하는 기능 추가 (선택 사항)

### Acceptance Criteria

- [ ] 도시 필터 선택 시 해당 도시의 마커만 표시
- [ ] 태그 필터 선택 시 해당 태그의 마커만 표시
- [ ] 복합 필터 (도시 + 태그) 동시 적용 동작
- [ ] 필터 초기화 버튼으로 모든 필터 해제
- [ ] URL에 필터 상태 반영 (`?city=seoul&tag=brutalism`)
- [ ] URL 공유 시 필터 상태 복원
- [ ] 클러스터 원형 + 숫자 표시 (줌 레벨에 따라)
- [ ] 클러스터 클릭 시 `getClusterExpansionZoom`으로 확대
- [ ] 개별 마커 클릭 시 팝업 + 선택 동작 유지
- [ ] 선택된 마커의 시각적 강조 (크기/테두리 변화)
- [ ] 건축가별 마커 색상이 ArchitectLegend와 일치
- [ ] 50개+ 마커에서 부드러운 렌더링 성능
- [ ] 모든 UI 문자열 i18n 키 사용 (하드코딩 문자열 없음)
- [ ] 모바일 반응형 (필터 UI 축소/토글)
- [ ] `npm run build` 성공

### Files to Create / Modify

**신규 생성:**

| 파일 | 설명 |
|------|------|
| `src/components/features/map/map-filter.tsx` | 리팩토링된 필터 컴포넌트 (기존 `map-filters.tsx` 교체) |
| `src/lib/map/buildings-to-geojson.ts` | Building[] → GeoJSON FeatureCollection 변환 유틸리티 |

**수정:**

| 파일 | 변경 내용 |
|------|----------|
| `src/components/features/map/map-view.tsx` | DOM 마커 제거, Source/Layer 기반으로 전면 리팩토링 |
| `src/components/features/map/building-marker.tsx` | 삭제 또는 fallback용 유지 |
| `src/components/features/map/building-popup.tsx` | 레이어 클릭 이벤트에서 호출되도록 수정 |
| `src/components/features/map/architect-legend.tsx` | 레이어 색상과 동기화 확인 |
| `src/components/features/map/map-filters.tsx` | `map-filter.tsx`로 교체 후 삭제 |
| `src/lib/stores/map-filter-store.ts` | URL sync 액션 추가 (`syncFromUrl`, `toSearchParams`) |
| `src/app/[locale]/map/page.tsx` | URL search params 연동, 새 컴포넌트 import |
| `messages/en.json` | 필터 관련 i18n 키 추가 |
| `messages/ko.json` | 필터 관련 i18n 키 추가 |

### Risk & Mitigation

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Symbol layer 마이그레이션으로 기존 popup/selection 동작 깨짐 | High | 기존 DOM 마커를 fallback으로 유지하며 점진 전환. `BuildingMarker` 즉시 삭제하지 않음 |
| MapLibre GL 표현식에서 선택 상태 동적 반영 제한 | Medium | 별도 `selected-point` 하이라이트 레이어 추가로 우회 |
| URL search params hydration 시 SSR/CSR 불일치 | Medium | `useSearchParams`를 `Suspense`로 래핑, 초기 로드 시 스토어 sync |
| 클러스터링 시 개별 마커 선택 UX 변화 | Low | 클러스터 내 건축물은 줌 인 후 선택하도록 안내 |

---

## Section 03: Home Page Redesign

### Background

현재 홈 페이지는 기본적인 히어로 텍스트 + Featured 큐레이션 가로 스크롤 + 4개 진입 카드로 구성되어 있다. 기능적으로는 동작하지만 포트폴리오 수준의 첫인상을 주기에는 부족하다.

사용자가 사이트에 처음 도착했을 때 "건축 큐레이션 프로젝트"라는 정체성을 즉각적으로 전달해야 한다. 이를 위해 홈 페이지를 전면 재디자인한다.

**핵심 방향:**
- 히어로 + 진입점이 사이트의 인상을 결정한다
- Featured/큐레이션 셀렉션은 제거하거나 최소화 — 무엇을 넣을지는 TBD
- 건축적 라인 모션과 타이포그래피가 시각적 주축
- 포트폴리오급 비주얼 퀄리티

### Current State

**파일**: `src/app/[locale]/page.tsx`

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

**사용 중인 컴포넌트/유틸리티:**
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

### Design System

재디자인은 기존 디자인 시스템 토큰을 엄격히 따른다.

**Color Palette (Achromatic, OKLCh):**

| Token | Tailwind Class | OKLCh Value | 용도 |
|-------|---------------|-------------|------|
| `--background` | `bg-background` | `oklch(1 0 0)` | 페이지 배경 |
| `--foreground` | `text-foreground` | `oklch(0.145 0 0)` | 본문 텍스트 |
| `--muted` | `bg-muted` | `oklch(0.97 0 0)` | 보조 배경 |
| `--muted-foreground` | `text-muted-foreground` | `oklch(0.556 0 0)` | 보조 텍스트 |
| `--border` | `border-border` | `oklch(0.922 0 0)` | 구분선, 테두리 |
| `--accent` | `bg-accent` | `oklch(0.97 0 0)` | 호버 배경 |
| `--primary` | `bg-primary` | `oklch(0.205 0 0)` | 강조 요소 |

**Typography:**

| 요소 | Font | Weight | Tailwind Classes |
|------|------|--------|-----------------|
| 히어로 타이틀 | Geist Mono | 300 (light) | `font-mono text-4xl sm:text-5xl md:text-6xl font-light tracking-tight` |
| 레이블 | Geist Mono | 400 | `font-mono text-micro tracking-label uppercase` |
| 서브레이블 | Geist Mono | 400 | `font-mono text-micro tracking-sublabel uppercase` |
| 본문 | Geist Mono | 400 | `font-mono text-sm leading-relaxed` |

**Layout Principles:**
- **Flat**: 그림자 없음 (`shadow-*` 사용 금지)
- **Structure via borders**: `border border-border`로 구조 표현
- **40px grid overlay**: 시각적 정렬 가이드
- **gap-px 패턴**: 카드 사이 1px 간격 (현재 entry points에서 사용 중)

### Dependencies

| 방향 | Section | 내용 |
|------|---------|------|
| **Requires** | section-01 (Image Optimization) | `OptimizedImage` 컴포넌트를 히어로/진입점 미리보기에 사용 |
| **Blocks** | - | 다른 섹션을 블로킹하지 않음 |

### Implementation Details

#### 1. HomeHero 컴포넌트

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

**구현 사항:**
- `function HomeHero({ subtitle, title, description }: HomeHeroProps)` — function 선언식
- Props는 `interface HomeHeroProps`로 정의
- 그리드 기반 레이아웃 (`grid`, `gap-*`, Tailwind tokens만 사용)
- 타이포그래피 중심: Geist Mono, `font-light`, `tracking-tight`
- `FadeIn` 래퍼로 등장 애니메이션 적용
- 반응형: `min-h-[60vh]` → 모바일에서는 `min-h-[50vh]`, 데스크톱에서 풀 비주얼
- 모든 문자열은 i18n 키로 props 전달 (하드코딩 금지)

#### 2. Entry Points 컴포넌트

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

**구현 사항:**
- `function HomeEntryPoints({ items }: HomeEntryPointsProps)` — function 선언식
- `interface HomeEntryPointItem` — title, description, href, count 필드
- `interface HomeEntryPointsProps` — `{ items: HomeEntryPointItem[] }`
- `StaggerContainer` + `StaggerItem`으로 순차 등장
- 기존 `gap-px` + `border border-border` 패턴 유지
- 반응형 그리드: `grid sm:grid-cols-2 lg:grid-cols-4`
- 각 카드에 count 표시 (`getBuildings().length` 등)
- 호버: `hover:bg-accent` (현재 패턴 유지), 추가로 건축적 느낌의 subtle interaction 탐색
- 조건부 렌더링은 삼항 연산자만 사용 (`&&` 금지)

#### 3. Line Animation 컴포넌트

**파일**: `src/components/features/home/line-animation.tsx`

건축적 라인 드로잉 애니메이션. 히어로 영역에 시각적 깊이를 더한다.

**구현 사항:**
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
- 반응형: SVG `viewBox` + `preserveAspectRatio`로 대응, 모바일에서는 간소화 또는 숨김 가능

#### 4. Overall Scroll Experience

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

**구현 사항:**
- `FadeIn` 래퍼로 섹션 간 부드러운 등장 전환 (기존 motion-wrapper 패턴)
- Mobile responsive: `sm:`, `md:`, `lg:` breakpoints (mobile-first)
- Featured 큐레이션 섹션은 이번 구현에서 제거 또는 플레이스홀더로 최소화

#### 5. Home Content 전략

| 영역 | 상태 | 설명 |
|------|------|------|
| Hero | **Core** | 반드시 구현. 사이트 정체성 전달의 핵심 |
| Entry Points | **Core** | 반드시 구현. 4개 진입점 + 데이터 프리뷰 |
| Featured Section | **Optional/TBD** | 기존 가로 스크롤 featured buildings는 제거 또는 최소화. 대체 콘텐츠는 미정 |

### Acceptance Criteria

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

### Files to Create / Modify

**New Files:**

| File | Description |
|------|------------|
| `src/components/features/home/home-hero.tsx` | 그리드 기반 히어로 컴포넌트 |
| `src/components/features/home/home-entry-points.tsx` | 4개 진입점 그리드 컴포넌트 |
| `src/components/features/home/line-animation.tsx` | SVG 건축적 라인 드로잉 애니메이션 |
| `src/components/features/home/home-featured.tsx` | (optional) Featured 섹션 — 필요 시에만 |

**Modified Files:**

| File | Changes |
|------|---------|
| `src/app/[locale]/page.tsx` | Major rewrite — 새 컴포넌트 조합으로 교체 |
| `messages/en.json` | 홈 관련 i18n 키 추가/수정 (필요 시) |
| `messages/ko.json` | 홈 관련 i18n 키 추가/수정 (필요 시) |

---

## Section 04: Shops & Events Module

### Background

Archi Curation은 건축물/건축가/도시 외에도 Shop(디자인 숍, 서점 등)과 Event(건축 전시, 디자인 페어 등)를 아카이빙한다. `src/types/entities.ts`에 `Shop`과 `Event` 인터페이스가 이미 정의되어 있지만, 실제 데이터 파일이나 UI 페이지는 아직 존재하지 않는다. 이 섹션에서는 시드 데이터를 생성하고, 기존 Buildings 패턴을 따르는 리스트/상세 페이지를 구축하며, 네비게이션과 지도에 통합한다.

### Current State

**타입 정의 (존재함):**

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

**미존재 항목:**
- `src/lib/data/shops.json` — 없음
- `src/lib/data/events.json` — 없음
- `/map/shops` 페이지 — 없음
- `/map/events` 페이지 — 없음
- `site-header.tsx` 네비게이션에 Shops/Events 링크 — 없음
- `data.ts`에 Shop/Event 쿼리 함수 — 없음
- 지도에 Shop/Event 마커 — 없음

### Dependencies

| 관계 | Section | 이유 |
|------|---------|------|
| **requires** | section-01 (Image Optimization) | ShopCard, EventCard에서 OptimizedImage 사용 |
| **requires** | section-02 (Map Enhancement) | 지도에 shop/event 마커 추가, entity type 필터 |
| **blocks** | section-06 (Data Pipeline) | Shop/Event 데이터 구조가 확정되어야 스키마 매핑 가능 |

### Implementation Details

#### Task 1: 시드 데이터 파일 생성

##### `src/lib/data/shops.json`

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

##### `src/lib/data/events.json`

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

#### Task 2: 데이터 쿼리 함수 추가

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

#### Task 3: 리스트 페이지

기존 `src/app/[locale]/map/buildings/page.tsx` 패턴을 따른다.

##### `src/app/[locale]/map/shops/page.tsx`

- `getShops()`, `getAllShopTags()`로 데이터 로드
- `StaggerContainer` + `StaggerItem`으로 그리드 애니메이션
- 태그 필터 바 (TagBadge 링크)
- `ShopCard` 컴포넌트로 각 항목 렌더링
- `setRequestLocale(locale)` 호출
- 메타데이터: `title: t("nav.shops")`

##### `src/app/[locale]/map/events/page.tsx`

- 동일 패턴, `getEvents()` + `getAllEventTags()` 사용
- `EventCard` 컴포넌트로 각 항목 렌더링
- 이벤트 날짜 범위 표시 (DateRange 포맷팅)

#### Task 4: 상세 페이지

##### `src/app/[locale]/map/shops/[slug]/page.tsx`

- `getShopBySlug(slug)`로 데이터 로드
- `notFound()` 처리 (slug 불일치 시)
- `generateStaticParams`: `getShops().map((s) => ({ slug: s.slug }))`
- 상세 정보: 이름(nameKo 병기), 카테고리, 설명, 주소, 영업시간, 웹사이트 링크
- 이미지 갤러리 (OptimizedImage 사용)
- 태그 표시
- 도시 링크 (`getCityById(shop.cityId)`)

##### `src/app/[locale]/map/events/[slug]/page.tsx`

- 동일 패턴, `getEventBySlug(slug)` 사용
- 추가 필드: `date` (DateRange 포맷팅), `venue`
- `generateStaticParams`: `getEvents().map((e) => ({ slug: e.slug }))`

#### Task 5: 카드 컴포넌트

##### `src/components/features/shops/shop-card.tsx`

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

##### `src/components/features/events/event-card.tsx`

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

#### Task 6: 네비게이션 업데이트

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

#### Task 7: 지도 통합

Section 2 (Map Enhancement) 완료 후 진행한다.

**마커 추가:**
- `map-view.tsx`의 GeoJSON source에 shop/event 데이터를 별도 source로 추가
- Shop 마커: 건물 마커와 구분되는 색상 (예: OKLCh accent 계열)
- Event 마커: 별도 아이콘/색상 (예: 원형 + 별표)
- `location`이 optional인 Event는 마커 미표시

**Entity Type 필터:**
- `map-filter.tsx`에 entity type 셀렉터 추가
- 기본값: Buildings만 표시
- 토글 버튼: Buildings / Shops / Events (복수 선택 가능)
- 필터 상태: URL search params에 `types=building,shop,event` 형태로 반영

#### Task 8: i18n 문자열 추가

**`messages/en.json` 추가 키:**

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

**`messages/ko.json` 추가 키:**

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

### Acceptance Criteria

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

### Files to Create

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

### Files to Modify

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

## Section 05: Diagram Enhancement + 2nd Generation Graphics

### Background

현재 다이어그램은 D3.js force-directed graph로 구현되어 있으며, Force / Timeline / Geography 세 가지 레이아웃 모드를 제공한다. 선택된 건축물-건축가-도시 간의 관계를 시각화하는 핵심 기능이다.

이 섹션에서는 두 가지 방향의 작업을 진행한다:

1. **기존 다이어그램 폴리시** — 노드, 링크, 라벨, 그리드 배경의 시각적 품질 향상
2. **2차 그래픽 전환 모드 프로토타입** — Blueprint(도면풍 그리드)와 Poster(포스터풍 프린트) 두 가지 새로운 모드 탐색

2차 그래픽 모드는 탐색적 프로토타입이다. 유저가 결과물을 평가한 뒤 방향을 결정하며, 완성도보다 가능성 검증에 초점을 둔다.

### Current State

**파일 구성:**

| 파일 | 줄 수 | 역할 |
|------|-------|------|
| `src/components/features/diagram/network-diagram.tsx` | 328 | D3 렌더링, 레이아웃 로직, 줌/드래그, 툴팁 |
| `src/components/features/diagram/diagram-view.tsx` | 83 | 컨테이너, ResizeObserver, 레이아웃/익스포트 컨트롤 |
| `src/components/features/diagram/layout-controls.tsx` | 35 | Force/Timeline/Geography 모드 토글 버튼 |
| `src/components/features/diagram/export-button.tsx` | 39 | html-to-image PNG 익스포트 (pixelRatio: 2) |
| `src/components/features/diagram/diagram-empty.tsx` | - | 선택 없음 상태 UI |
| `src/lib/diagram/transform.ts` | 122 | 데이터 → DiagramGraph 변환 (nodes, links) |

**렌더링 세부사항:**
- **D3.js 7.9** force simulation (`forceLink`, `forceManyBody`, `forceCenter`, `forceCollide`)
- **노드 3종**: building(circle, r=18), architect(rounded rect, r=14), city(triangle, r=12)
- **링크 3종**: architect-building(실선, 1px), city-building(실선, 1px), same-architect(점선, 0.5px)
- **그리드 배경**: 40px SVG pattern, `oklch(0.145 0 0 / 5%)` 스트로크
- **줌/팬**: `d3.zoom`, scaleExtent `[0.3, 4]`
- **드래그**: `d3.drag` (force simulation alpha 연동)
- **툴팁**: React state 기반, mouseenter/mouseleave
- **라벨**: Geist Mono 9px, opacity 0.7, 배경 박스 없음
- **워터마크**: "Archi Curation" 우하단 고정

**레이아웃 모드:**
- **Force**: 기본 force simulation (center + charge + collide)
- **Timeline**: `forceX`에 year 기반 `scaleLinear` 적용, `forceY` 약한 중심 당김
- **Geography**: `forceX`/`forceY`에 lng/lat 기반 scale 적용

세 레이아웃 모두 `network-diagram.tsx`의 단일 `useEffect` 안에 조건문(`if/else if`)으로 하드코딩되어 있다.

**데이터 흐름:**

```
Building[] + Architect[] + City[]
  → buildDiagramGraph() (transform.ts)
  → DiagramGraph { nodes: DiagramNode[], links: DiagramLink[] }
  → NetworkDiagram (d3 렌더링)
```

### Dependencies

| 방향 | 대상 | 설명 |
|------|------|------|
| depends on | - | 독립적 (다른 섹션에 의존하지 않음) |
| blocks | - | 다른 섹션을 차단하지 않음 |

Wave 1에서 Section 1, Section 2와 병렬 진행 가능.

### Implementation Details

#### Task 1: 기존 레이아웃 시각적 폴리시

##### 1-1. 노드 스타일 개선
- 노드 크기 미세 조정 (building 20, architect 16, city 14 검토)
- `stroke`를 `var(--background)` 대신 디자인 토큰 기반 보더로 변경
- shadow 없이 flat 유지 (achromatic 디자인 원칙)
- hover 시 노드 확대 또는 보더 강조 (subtle transition)

##### 1-2. 라벨 가독성 향상
- 라벨에 배경 박스 추가 (`rect` behind `text`, `var(--background)` fill, padding 2-4px)
- 폰트 크기 9px → 10px 검토
- opacity 0.7 → 0.85 검토
- 긴 라벨 truncation (max 15자 + ellipsis)

##### 1-3. 링크 스타일 개선
- 직선(`line`) → 곡선(`path` with `d3.linkHorizontal` 또는 `curveBasis`) 검토
- architect-building 링크: 1px → 1.5px, 색상 contrast 강화
- city-building 링크: 색상 구분 (별도 토큰)
- same-architect 링크: 점선 패턴 세분화 (`3 3`)
- hover 시 연결된 링크 하이라이트

##### 1-4. 그리드 배경 정제
- 40px 패턴 유지, 스트로크 색상 미세 조정
- 보조 그리드 라인 (200px 간격, 약간 더 진한 색) 추가 검토
- 줌 레벨에 따른 그리드 표시 조절 (먼 거리에서는 보조 그리드만 표시)

#### Task 2: 레이아웃 아키텍처 플러그인 패턴 리팩토링

`network-diagram.tsx`의 레이아웃 로직을 독립 모듈로 분리하여 새 레이아웃 추가가 용이한 구조를 만든다.

##### 2-1. DiagramLayout 인터페이스 정의

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

##### 2-2. 기존 레이아웃 분리

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

##### 2-3. 레이아웃 레지스트리

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

##### 2-4. NetworkDiagram 리팩토링

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

#### Task 3: Blueprint 모드 (도면풍 그리드)

건축 도면의 미학을 참조한 정적 레이아웃. force simulation을 사용하지 않고 `getNodePosition`으로 노드를 직접 배치한다.

##### 3-1. 레이아웃 로직
- building 노드를 그리드 rows/columns에 정렬 배치
- architect 노드를 건물 그룹 상단 또는 좌측에 배치
- city 노드를 섹션 헤더 위치에 배치
- 정렬 기준: city 그룹 → architect 서브그룹 → building 시간순

##### 3-2. 연결선 스타일
- 직선 대신 직각(orthogonal) 또는 45도 각도 연결선
- `d3.line()` + step interpolation (`d3.curveStep`, `d3.curveStepAfter`)
- 연결선 색상: 기존보다 얇고 정밀한 느낌 (0.5px, 진한 그레이)

##### 3-3. 라벨/번호 체계
- 각 building에 일련번호 부여 (01, 02, 03...)
- 라벨 형식: `01 — Building Name`
- Geist Mono uppercase, letter-spacing 확대
- 범례(legend) 영역에 번호-이름 매핑 표시

##### 3-4. 도면 프레임
- `renderOverlay`로 캔버스 외곽에 이중 보더 프레임 렌더링
- 우하단에 title block: 프로젝트명, 날짜, 노드 수 정보
- 프레임 여백: 상하좌우 60px
- 프레임 선: 1px + 0.5px 이중선, `oklch(0.3 0 0)`

##### 3-5. 전체 미학
- 배경: 순백 또는 미색 (off-white)
- 그리드: 건축 도면의 mm 눈금 느낌 (20px 세밀 그리드 + 100px 주요 그리드)
- 노드: 얇은 외곽선, 최소한의 채움색
- 활자: 정밀하고 기술적인 느낌

#### Task 4: Poster 모드 (포스터풍 프린트)

인쇄 가능한 포스터를 목표로 한 정적 레이아웃. 큐레이션 결과물을 시각적 아웃풋으로 전환하는 실험.

##### 4-1. 캔버스 설정
- A3 비율(297:420 = 1:1.414) 또는 A4 비율 캔버스
- 컨테이너 내에서 비율 유지하며 fit
- 인쇄 시 의미 있는 해상도 확보 (export pixelRatio: 3 검토)

##### 4-2. 타이포그래피 타이틀
- 캔버스 상단에 대형 타이틀 영역
- "Archi Curation" 또는 큐레이션 셀렉션 이름
- Geist Mono, light weight, 대형 (48-72px 상당)
- 서브타이틀: 선택된 건축물 수, 도시, 날짜

##### 4-3. 건축물 정보 카드 배치
- 각 building을 카드형 요소로 표현 (직사각형 영역)
- 카드 내용: 이름, 건축가, 연도, 도시
- 그리드 레이아웃 (3-4열)
- 카드 간 연결 관계는 얇은 선으로 hint

##### 4-4. 지리적 추상 요소
- 도시 위치를 추상적 좌표로 배치 (작은 점 + 라벨)
- 카드와 도시 점 사이에 미세한 연결선
- 지도 투영이 아닌 추상적 공간 배치

##### 4-5. 큐레이션 캡션 영역
- 캔버스 하단에 캡션/크레딧 영역
- "Curated by Archi Curation" + 날짜
- 작은 범례: 노드 타입 설명

#### Task 5: LayoutControls 업데이트

##### 5-1. 새 모드 추가
```ts
import { LAYOUTS, type LayoutMode } from "./layouts";

// MODES 배열을 레지스트리에서 동적 생성
const MODES = Object.keys(LAYOUTS) as LayoutMode[];
```

##### 5-2. 모드 그룹 구분
- 기존 3개 (Force, Timeline, Geography) → "Analysis" 그룹
- 새로운 2개 (Blueprint, Poster) → "Graphics" 그룹
- 시각적 구분선 (`border-r` 또는 gap) 으로 그룹 분리

##### 5-3. 전환 애니메이션
- 레이아웃 변경 시 노드 위치 전환 애니메이션
- force simulation 기반 → 정적 레이아웃 전환: `d3.transition().duration(500)` 으로 노드 이동
- 정적 → 정적 전환: 동일하게 transition
- 정적 → force 전환: 현재 위치에서 simulation 시작

#### Task 6: PNG Export 호환성 확인

##### 6-1. 모든 모드에서 export 동작 검증
- Blueprint 모드: 프레임 포함 export
- Poster 모드: A3/A4 비율 유지하여 export
- `html-to-image` 의 `toPng` 이 SVG overlay 요소를 올바르게 캡처하는지 확인

##### 6-2. Export 옵션 확장 (선택)
- Poster 모드에서 pixelRatio: 3 (인쇄 품질)
- 파일명에 레이아웃 모드 포함: `archi-curation-blueprint.png`

### i18n Keys (추가분)

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

### Acceptance Criteria

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

### Files to Create/Modify

**신규 생성:**

| 파일 | 설명 |
|------|------|
| `src/components/features/diagram/layouts/types.ts` | `DiagramLayout` interface, `LayoutContext` type |
| `src/components/features/diagram/layouts/force-layout.ts` | Force 레이아웃 모듈 |
| `src/components/features/diagram/layouts/timeline-layout.ts` | Timeline 레이아웃 모듈 |
| `src/components/features/diagram/layouts/geography-layout.ts` | Geography 레이아웃 모듈 |
| `src/components/features/diagram/layouts/blueprint-layout.ts` | Blueprint 레이아웃 모듈 |
| `src/components/features/diagram/layouts/poster-layout.ts` | Poster 레이아웃 모듈 |
| `src/components/features/diagram/layouts/index.ts` | 레이아웃 레지스트리, `LayoutMode` type export |

**수정:**

| 파일 | 변경 내용 |
|------|----------|
| `src/components/features/diagram/network-diagram.tsx` | 레이아웃 분기 제거 → 플러그인 호출, 노드/링크/라벨 스타일 개선, 전환 애니메이션 |
| `src/components/features/diagram/layout-controls.tsx` | `LayoutMode` import 경로 변경, 모드 그룹 구분 UI, 5개 모드 표시 |
| `src/components/features/diagram/diagram-view.tsx` | `LayoutMode` import 경로 변경 |
| `src/components/features/diagram/export-button.tsx` | 레이아웃 모드별 파일명, Poster pixelRatio 조정 (선택) |
| `messages/en.json` | `diagram.layout.blueprint`, `diagram.layout.poster`, 그룹 라벨 키 추가 |
| `messages/ko.json` | 동일 키 한국어 번역 추가 |

---

## Section 06: Data Pipeline Preparation

### Background

현재 모든 데이터는 `src/lib/data/` 디렉토리의 정적 JSON 파일로 관리된다. 큐레이터가 직접 JSON을 편집하는 방식으로 운영 중이며, 이는 개발 환경에서만 수정이 가능하다는 한계가 있다.

장기적으로 Google Sheets를 데이터 소스로 전환할 계획이 있다. 이 섹션은 **실제 마이그레이션을 수행하지 않는다.** 현재 JSON 기반 운영을 유지하면서, 향후 Google Sheets 전환 시 필요한 도구와 문서를 미리 준비하는 것이 목표다.

### Current State

**데이터 파일:**

| 파일 | 상태 | 비고 |
|------|------|------|
| `src/lib/data/buildings.json` | 존재 | ~4개 건축물 |
| `src/lib/data/architects.json` | 존재 | ~4명 건축가 |
| `src/lib/data/cities.json` | 존재 | ~2-3개 도시 |
| `src/lib/data/shops.json` | section-04에서 생성 예정 | 2-3개 시드 |
| `src/lib/data/events.json` | section-04에서 생성 예정 | 2-3개 시드 |

**타입 정의:**
- `src/types/entities.ts` — Building, Architect, City, Shop, Event 인터페이스
- `src/types/common.ts` — ImageMeta, GeoLocation, DateRange, Tag, PublishStatus 공통 타입

### Implementation Details

#### 1. 스키마 매핑 문서 (`docs/data-pipeline.md`)

JSON 구조와 Google Sheets 탭/열 간의 매핑을 정의하는 참조 문서를 작성한다.

##### 1.1 Sheets 탭 구조

| 탭 이름 | 엔티티 | 비고 |
|---------|--------|------|
| Buildings | Building | 메인 데이터 |
| Architects | Architect | 메인 데이터 |
| Cities | City | 메인 데이터 |
| Shops | Shop | section-04 이후 |
| Events | Event | section-04 이후 |

##### 1.2 필드 매핑 규칙

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
→ 열: `date_start`, `date_end`

**string[] (notableWorks)** — 쉼표 구분:
→ 열: `notableWorks` = `"Chapel of Light, Row House"`

##### 1.3 각 엔티티별 열 목록

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

#### 2. CSV → JSON 변환 스크립트 (`scripts/csv-to-json.ts`)

CSV 파일을 읽어 현재 JSON 데이터 구조로 변환하는 스크립트를 구현한다.

**실행 방법:**
```bash
npx tsx scripts/csv-to-json.ts --input ./data-csv/ --output ./src/lib/data/
```

**핵심 기능:**

```typescript
const ENTITY_FILES = ["buildings", "architects", "cities", "shops", "events"] as const;

const parseBuilding = (row: CsvRow): Building => { ... };
const parseArchitect = (row: CsvRow): Architect => { ... };
const parseCity = (row: CsvRow): City => { ... };
const parseShop = (row: CsvRow): Shop => { ... };
const parseEvent = (row: CsvRow): Event => { ... };
```

**타입 변환 규칙:**

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

**Slug 자동 생성:**

```typescript
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
```

**이미지 메타데이터 재구성:**

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

**의존성:**
- CSV 파싱: Node.js 내장 기능 또는 가벼운 라이브러리 (예: `papaparse`)
- 파일 I/O: `node:fs/promises`
- CLI 인자 파싱: `node:util` parseArgs 또는 간단한 수동 파싱

#### 3. 데이터 검증 유틸리티 (`scripts/validate-data.ts`)

모든 JSON 데이터 파일의 무결성을 검사하는 스크립트를 구현한다.

**실행 방법:**
```bash
npm run validate
```

**검증 항목:**

| 검증 | 대상 | 설명 |
|------|------|------|
| **slug 고유성** | 모든 엔티티 | 동일 타입 내 slug 중복 없음 |
| **id 고유성** | 모든 엔티티 | 동일 타입 내 id 중복 없음 |
| **좌표 범위** | Building, City, Shop, Event | lat: -90 ~ 90, lng: -180 ~ 180 |
| **필수 필드** | 모든 엔티티 | id, slug, status 등 필수 필드 존재 및 비어 있지 않음 |
| **status 유효값** | 모든 엔티티 | `"draft"`, `"published"`, `"archived"` 중 하나 |
| **참조 무결성 (architectId)** | Building | architectId가 architects.json에 존재 |
| **참조 무결성 (cityId)** | Building, Shop, Event | cityId가 cities.json에 존재 |
| **year 합리성** | Building | 1000 <= year <= 현재 연도 + 10 |
| **이미지 src 비어 있지 않음** | 모든 엔티티 | images 배열 내 src 필드가 비어 있지 않음 |
| **태그 slug 형식** | 모든 엔티티 | tag.slug이 kebab-case 형식 |

**에러 리포트:**

```typescript
interface ValidationError {
  entity: string;
  id: string;
  field: string;
  message: string;
}
```

**종료 코드:** `0` = 모든 검증 통과, `1` = 하나 이상의 에러 발견 (CI에서 빌드 실패 처리)

#### 4. npm 스크립트 추가 (`package.json`)

```json
{
  "scripts": {
    "validate": "tsx scripts/validate-data.ts"
  }
}
```

#### 5. GitHub Actions 워크플로우 템플릿 (`.github/workflows/sync-data.yml`)

실제 Google Sheets API 연동은 구성하지 않으며, 향후 활성화할 수 있는 템플릿만 작성한다.

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

### Acceptance Criteria

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

### Files to Create / Modify

**신규 생성:**

| 파일 | 설명 |
|------|------|
| `docs/data-pipeline.md` | JSON ↔ Google Sheets 스키마 매핑 문서 |
| `scripts/csv-to-json.ts` | CSV → JSON 변환 스크립트 |
| `scripts/validate-data.ts` | 데이터 검증 유틸리티 |
| `.github/workflows/sync-data.yml` | GitHub Actions 워크플로우 템플릿 |

**수정:**

| 파일 | 변경 내용 |
|------|-----------|
| `package.json` | `"validate"` 스크립트 추가 |

---

## Execution Rules

1. **Dependency order**: Wave 순서를 반드시 따른다. Wave 1(01, 02, 05) → Wave 2(03) → Wave 3(04) → Wave 4(06). 순차 실행 시 01 → 02 → 05 → 03 → 04 → 06 순으로 진행한다.
2. **Acceptance criteria verification**: 각 섹션 완료 후 해당 섹션의 Acceptance Criteria를 모두 확인한다.
3. **Build verification**: 각 섹션 완료 후 반드시 `npm run build`를 실행하여 빌드 성공을 확인한다. 빌드 실패 시 즉시 수정한다.
4. **Commit per section**: 각 섹션 완료 후 기능 단위로 커밋한다. 커밋 메시지 형식: `{type}: 한국어 설명`
5. **i18n**: 모든 UI 문자열은 반드시 i18n 키를 사용한다 (`messages/en.json`, `messages/ko.json`). 하드코딩 문자열 금지.
6. **Coding conventions**: 
   - 컴포넌트는 `function` 선언식 사용
   - Props는 `interface`로 정의
   - 조건부 렌더링은 삼항 연산자만 사용 (`&&` 금지)
   - Tailwind 테마 토큰만 사용, 하드코딩 색상값 금지
   - `cn()` 유틸리티로 조건부 클래스 조합
   - 파일명 kebab-case, 컴포넌트명 PascalCase
   - 컴포넌트 파일 300줄 이내, JSX return 100줄 이내
   - `<button>`에 반드시 `type` 속성 명시
   - Zustand 셀렉터로 필요한 값만 구독
7. **Bug fix protocol**: 버그 발생 시 `.claude/rules/investigate-first.md`의 프로토콜을 따른다. 데이터 흐름 추적 → 재현 시나리오 문서화 → 근본 원인 파악 → 수정.

---

## Completion Signal

모든 6개 섹션의 구현이 완료되고, 모든 Acceptance Criteria가 충족되며, `npm run build`가 성공하면 다음을 출력한다:

<promise>ALL-SECTIONS-COMPLETE</promise>
