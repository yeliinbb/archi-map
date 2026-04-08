# Section 1: Image Optimization Foundation

## Background

이 섹션은 프로젝트 전체의 이미지 성능 기반을 구축한다. 현재 프로젝트의 모든 이미지는 네이티브 `<img>` 태그를 사용하고 있어 다음과 같은 문제가 발생한다:

- **Cumulative Layout Shift (CLS)**: 이미지 로드 전 공간이 확보되지 않아 레이아웃이 밀리는 현상
- **최적화 부재**: Next.js Image 컴포넌트의 자동 포맷 변환(WebP/AVIF), lazy loading, srcset 생성 기능을 활용하지 않음
- **로딩 경험 부재**: 이미지 로드 전 빈 공간만 표시되어 사용자에게 불완전한 인상을 줌

이 섹션은 다른 모든 이미지 관련 섹션(Section 3: Home Redesign, Section 4: Shops/Events)의 기반이 되므로 가장 먼저 완료해야 한다.

---

## Current State

### 이미지 렌더링 방식

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

---

## Dependencies

| 방향 | 대상 | 설명 |
|------|------|------|
| **requires** | 없음 | 독립적으로 착수 가능 |
| **blocks** | Section 3 (Home Redesign) | 홈 히어로 이미지가 OptimizedImage 사용 |
| **blocks** | Section 4 (Shops/Events) | Shop/Event 카드 이미지가 OptimizedImage 사용 |

---

## Requirements

완료 시 다음 조건이 모두 충족되어야 한다:

1. 모든 이미지 렌더링이 Next.js `<Image>` 컴포넌트를 통해 이루어진다
2. 이미지 로드 전 Skeleton placeholder가 표시된다
3. CLS(Cumulative Layout Shift)가 0이다
4. 반응형 `sizes` prop이 모든 이미지에 적용된다
5. `eslint-disable @next/next/no-img-element` 주석이 제거된다
6. 기존 시각적 디자인이 유지된다 (레이아웃, 호버 효과 등)

---

## Implementation Details

### Task 1: OptimizedImage 컴포넌트 생성

**파일**: `src/components/shared/optimized-image.tsx` (신규)

Next.js `<Image>`를 감싸는 프로젝트 전용 래퍼 컴포넌트를 생성한다.

#### Props 인터페이스

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

#### 핵심 동작

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

#### 구현 예시

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

#### 주의사항

- `"use client"` 필수 (useState 사용)
- Tailwind 테마 토큰만 사용: `bg-muted`, `animate-pulse` (하드코딩 색상 금지)
- `cn()` 유틸리티로 클래스 조합 (`@/lib/utils`에서 import)
- 파일명: `optimized-image.tsx` (kebab-case 컨벤션)
- 컴포넌트명: `OptimizedImage` (PascalCase 컨벤션)

---

### Task 2: ImageMeta 타입 확인 및 데이터 보강

**파일**: `src/types/common.ts` (확인), `src/lib/data/*.json` (수정)

#### 타입 상태

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

#### JSON 데이터 보강

실제 JSON 데이터 파일에서 각 이미지 항목에 `width`/`height` 값을 추가한다.

수정 대상 파일:
- `src/lib/data/buildings.json` — 모든 building의 `images` 배열 내 항목
- `src/lib/data/architects.json` — `portrait` 항목
- `src/lib/data/cities.json` — 모든 city의 `images` 배열 내 항목

각 이미지의 실제 픽셀 크기를 확인하여 입력한다. 이미지가 외부 URL인 경우 원본 비율을 기준으로 표준 크기를 사용한다 (예: 1600x1200, 800x800 등).

> **점진적 마이그레이션**: width/height가 optional이므로 값이 없는 이미지도 동작에 문제없다. OptimizedImage는 width/height 부재 시 fill 모드로 fallback한다.

---

### Task 3: 기존 컴포넌트 마이그레이션

각 컴포넌트에서 `<img>` 태그를 `<OptimizedImage>`로 교체한다.

#### 3-1. BuildingGridCard (건물 그리드 카드 썸네일)

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

#### 3-2. BuildingDetailPage (건물 상세 메인 이미지)

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

#### 3-3. BuildingPopup (지도 팝업 이미지)

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

#### 3-4. HomePage (홈 페이지 이미지)

**파일**: `src/app/[locale]/page.tsx`

홈 페이지의 모든 `<img>` 태그를 `<OptimizedImage>`로 교체. 각 이미지의 컨텍스트에 맞는 sizes와 priority를 설정한다.

> 홈 페이지는 Section 3에서 전면 재디자인 예정이므로, 이 단계에서는 기존 이미지만 OptimizedImage로 전환하되 레이아웃은 변경하지 않는다.

---

### Task 4: 반응형 sizes prop 가이드

각 사용처별 `sizes` 값 참고표:

| 컴포넌트 | 레이아웃 | sizes 값 |
|----------|---------|----------|
| BuildingGridCard | 2col(sm) / 3col(md) / 4col(lg) | `"(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"` |
| BuildingDetailPage | 단일 컬럼 max-w-2xl | `"(max-width: 672px) 100vw, 672px"` |
| BuildingPopup | 고정 너비 팝업 | `"280px"` |
| ArchitectPortrait (향후) | 리스트 카드 내 | `"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` |
| CityImage (향후) | 리스트 카드 내 | `"(max-width: 640px) 100vw, 50vw"` |

---

### Task 5: next.config 이미지 도메인 설정

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

---

## Acceptance Criteria

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

---

## Files to Create/Modify

### 신규 생성

| 파일 경로 | 설명 |
|-----------|------|
| `src/components/shared/optimized-image.tsx` | OptimizedImage 래퍼 컴포넌트 |

### 수정

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

### 변경 불필요

| 파일 경로 | 이유 |
|-----------|------|
| `src/types/common.ts` | ImageMeta에 width/height가 이미 optional로 존재 |
| `src/types/entities.ts` | 타입 변경 없음 |

---

## Tech Stack

| 기술 | 용도 |
|------|------|
| **Next.js Image** (`next/image`) | 이미지 최적화, WebP/AVIF 자동 변환, srcset 생성 |
| **Tailwind CSS 4** | Skeleton 스타일링 (`animate-pulse`, `bg-muted`), 반응형 |
| **TypeScript 5** | Props 타입 정의, 타입 안전성 |
| **React 19** | `useState` (로딩 상태), `"use client"` directive |

---

## Coding Conventions

이 섹션의 코드는 프로젝트 코딩 컨벤션을 따른다:

| 규칙 | 적용 |
|------|------|
| 컴포넌트: `function` 선언식 | `export function OptimizedImage(...)` |
| Props: `interface` 키워드 | `interface OptimizedImageProps { ... }` |
| 조건부 렌더링: 삼항 연산자 | `{condition ? <A /> : <B />}` / `{condition ? <A /> : null}` |
| `&&` 금지 | 기존 `&&` 사용처도 삼항으로 수정 |
| UI 문자열: i18n 번역 키 | 이미지 컴포넌트 자체에는 UI 문자열 없음, alt는 데이터에서 전달 |
| Tailwind 테마 토큰만 사용 | `bg-muted`, `animate-pulse` (하드코딩 색상 금지) |
| 파일명: kebab-case | `optimized-image.tsx` |
| 컴포넌트명: PascalCase | `OptimizedImage` |
| 파일 크기 제한 | 컴포넌트 300줄 이내 |
