# 코딩 컨벤션

## 컴포넌트 & 함수

- 컴포넌트: `function` 선언식
- 유틸리티: 화살표 함수
- Props 정의: `interface`, 일반 타입: `type`

```tsx
// ✅ 컴포넌트
function BuildingCard({ building }: BuildingCardProps) { ... }

// ✅ 유틸리티
const formatSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");
```

## JSX 규칙

- `<button>`에 반드시 `type="button"` 또는 `type="submit"` 명시
- 조건부 렌더링: 삼항 연산자 사용, `&&` 금지

```tsx
// ✅
{isLoading ? <Skeleton /> : <Content />}

// ❌
{isLoading && <Skeleton />}
```

## Tailwind CSS

- 하드코딩 색상값(`#fff`, `rgb(...)`) 금지 → Tailwind 테마 토큰 사용
- 반복되는 스타일 조합 → `cn()` 유틸리티 + CVA 사용
- 반응형: mobile-first (`sm:`, `md:`, `lg:`)

## Zustand

- 하나의 스토어 = 하나의 도메인 관심사
- 셀렉터로 필요한 값만 구독

```tsx
// ✅
const selectedIds = useSelectionStore((s) => s.selectedIds);

// ❌
const store = useSelectionStore();
```

## 파일 크기 제한

- 컴포넌트 파일: 300줄 이내
- 훅: 200줄 이내
- JSX return: 100줄 이내
- 초과 시 분리 필요

## 네이밍

- 파일: kebab-case (`building-card.tsx`)
- 컴포넌트: PascalCase (`BuildingCard`)
- 훅: camelCase (`useSelection`)
- 상수: UPPER_SNAKE_CASE (`MAX_SELECTION_COUNT`)

## i18n

- UI 문자열은 반드시 번역 키 사용 (`t("nav.buildings")`)
- 하드코딩 문자열 금지
- 번역 파일: `messages/en.json`, `messages/ko.json`
