# Section 02 — Map Enhancement: Filtering + Clustering

> **Status**: Planned
> **Priority**: High
> **Dependencies**: requires nothing
> **Blocks**: section-04-shops-events
> **Wave**: 1 (병렬 진행 가능)

---

## Background

현재 지도 페이지(`/map`)는 필터 UI가 없고, DOM 기반 `<Marker>` 컴포넌트를 사용하여 건축물을 표시한다. 건축물 수가 50개 이상으로 늘어나면 DOM 마커의 렌더링 비용이 급격히 증가하고, 밀집 지역에서 마커가 겹쳐 사용성이 떨어진다.

이 섹션에서는 두 가지를 해결한다:

1. **필터링 UI** — 도시/태그로 지도 위 건축물을 필터링하는 인터페이스
2. **Symbol Layer + Clustering** — DOM 마커를 MapLibre GL 네이티브 레이어로 마이그레이션하고 클러스터링 적용

---

## Current State

### 기술 스택
- MapLibre GL JS 5.22 + react-map-gl 8.1
- OpenFreeMap Liberty 타일 (`https://tiles.openfreemap.org/styles/liberty`)

### 기존 컴포넌트 구조

| 컴포넌트 | 파일 경로 | 역할 |
|----------|----------|------|
| `MapView` | `src/components/features/map/map-view.tsx` | 지도 렌더링, DOM 마커 순회, 필터 적용 |
| `BuildingMarker` | `src/components/features/map/building-marker.tsx` | react-map-gl `<Marker>` 기반 DOM 마커. 건축가 색상 원형, 선택 시 ping 애니메이션 |
| `BuildingPopup` | `src/components/features/map/building-popup.tsx` | 마커 클릭 시 건축물 정보 팝업 |
| `ArchitectLegend` | `src/components/features/map/architect-legend.tsx` | 건축가별 색상 범례 (좌측 사이드바) |
| `SelectionSidebar` | `src/components/features/map/selection-sidebar.tsx` | 선택된 건축물 목록 (우측 패널, 최대 10개) |
| `MapFilters` | `src/components/features/map/map-filters.tsx` | 기존 필터 UI (Zustand `map-filter-store` 기반, 도시/태그 토글) |

### 현재 한계

- **MapFilters 존재하나 URL 상태 미연동** — 필터 상태가 Zustand 스토어에만 저장되어 공유 불가
- **DOM 마커 성능** — `BuildingMarker`가 개별 React 컴포넌트로 렌더링되어 50개+ 시 성능 저하
- **클러스터링 없음** — 밀집 지역에서 마커 겹침, 줌 레벨별 자동 그룹화 부재
- **하드코딩 문자열** — MapFilters 내 "Filters", "City", "Tag / Style", "Clear Filters" 등이 i18n 키 미사용

---

## Requirements

### Part A — Map Filter UI 개선

MapFilters 컴포넌트를 확장하여 URL 기반 상태 관리와 i18n을 적용한다.

### Part B — Symbol Layer + Clustering

DOM 마커를 MapLibre GL 네이티브 GeoJSON 소스 + 레이어로 마이그레이션하고 클러스터링을 구현한다.

---

## Implementation Details

### Part A — Map Filter UI

#### A-1. MapFilter 컴포넌트 리팩토링

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

**UI 구성**:
- 도시 필터: 드롭다운 셀렉트 (현재 칩 방식에서 변경 — 도시 수 증가 대비)
- 태그 필터: 수평 칩 토글 (현행 유지)
- 활성 필터 영역: 선택된 필터를 작은 칩으로 표시, 개별 제거 가능
- 전체 초기화 버튼: 모든 필터 해제

**i18n 키**:
```json
{
  "map.filter.title": "Filters",
  "map.filter.city": "City",
  "map.filter.tag": "Tag / Style",
  "map.filter.clear": "Clear Filters",
  "map.filter.active_count": "{count} active"
}
```

#### A-2. 필터 상태 → URL Search Params

필터 상태를 URL search params로 관리하여 공유 가능하게 만든다.

```
/map?city=seoul,tokyo&tag=brutalism,minimalism
```

**구현 방식**:
- `useSearchParams()` + `useRouter()`로 URL 읽기/쓰기
- Zustand 스토어를 URL과 양방향 동기화 (스토어는 캐시 역할)
- 초기 로드 시 URL params → 스토어 hydration
- 필터 변경 시 `router.replace()` (히스토리 누적 방지)

**파일**: `src/lib/stores/map-filter-store.ts` 수정
- `syncFromUrl(params: URLSearchParams)` 액션 추가
- `toSearchParams(): URLSearchParams` 셀렉터 추가

#### A-3. 필터 적용 → GeoJSON 소스 업데이트

필터 변경 시 GeoJSON 소스의 데이터를 교체하여 마커를 업데이트한다.

- 필터된 buildings 배열 → FeatureCollection 변환
- `map.getSource('buildings').setData(filteredGeoJSON)` 호출
- 소스 데이터 교체는 MapLibre가 자동으로 부드럽게 처리

---

### Part B — Symbol Layer + Clustering

#### B-1. GeoJSON 소스 + 레이어 구성

DOM 마커(`BuildingMarker`)를 MapLibre GL 네이티브 레이어로 교체한다.

**GeoJSON Source 생성**:
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

**FeatureCollection 변환 함수**:

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

#### B-2. 클러스터 인터랙션

**클러스터 클릭 → 줌 인**:
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

**개별 마커 클릭 → 팝업 + 선택**:
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

#### B-3. 선택 상태 시각화

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

#### B-4. ArchitectLegend 동기화

`ArchitectLegend`의 색상이 symbol layer의 `circle-color`와 동일한 색상 매핑(`getArchitectColor`)을 사용하도록 확인한다.

- 기존 `getArchitectColor()` 함수가 이미 양쪽에서 공유 가능
- 레전드 항목 호버 시 해당 건축가의 마커만 하이라이트하는 기능 추가 (선택 사항)

---

## Acceptance Criteria

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

---

## Files to Create / Modify

### 신규 생성

| 파일 | 설명 |
|------|------|
| `src/components/features/map/map-filter.tsx` | 리팩토링된 필터 컴포넌트 (기존 `map-filters.tsx` 교체) |
| `src/lib/map/buildings-to-geojson.ts` | Building[] → GeoJSON FeatureCollection 변환 유틸리티 |

### 수정

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

---

## Tech Stack

| 기술 | 용도 |
|------|------|
| MapLibre GL JS 5.22 | GeoJSON 소스, 클러스터링, 네이티브 레이어 렌더링 |
| react-map-gl 8.1 | `<Source>`, `<Layer>`, `<Popup>` React 래퍼 |
| TypeScript 5 | 타입 안전한 GeoJSON Feature properties, 이벤트 핸들러 |
| Tailwind CSS 4 | 필터 UI 스타일링, 반응형 레이아웃 |
| Zustand | 필터 상태 관리 (URL과 양방향 동기화) |
| next-intl | 모든 UI 문자열 i18n |
| Framer Motion | 필터 패널 열기/닫기 애니메이션 (기존 패턴 유지) |

---

## Coding Conventions

이 섹션의 모든 코드는 프로젝트 코딩 컨벤션(`.claude/rules/coding-conventions.md`)을 따른다:

- **컴포넌트**: `function` 선언식 (`function MapFilter() {}`)
- **유틸리티**: 화살표 함수 (`const buildingsToFeatureCollection = () => {}`)
- **Props 타입**: `interface` 사용 (`interface MapFilterProps {}`)
- **일반 타입**: `type` 사용 (`type BuildingFeatureProperties = {}`)
- **조건부 렌더링**: 삼항 연산자 사용, `&&` 금지
- **i18n**: 모든 UI 문자열은 번역 키 사용 (`t("map.filter.city")`)
- **파일명**: kebab-case (`map-filter.tsx`, `buildings-to-geojson.ts`)
- **버튼**: `type="button"` 명시
- **Zustand 셀렉터**: 필요한 값만 구독 (`useMapFilterStore((s) => s.selectedCityIds)`)
- **Tailwind**: 테마 토큰 사용, 하드코딩 색상값 금지 (레이어 paint 속성 제외 — MapLibre GL 표현식은 CSS 변수 미지원이므로 OKLCh 토큰의 HSL 근사값 사용)

---

## Risk & Mitigation

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Symbol layer 마이그레이션으로 기존 popup/selection 동작 깨짐 | High | 기존 DOM 마커를 fallback으로 유지하며 점진 전환. `BuildingMarker` 즉시 삭제하지 않음 |
| MapLibre GL 표현식에서 선택 상태 동적 반영 제한 | Medium | 별도 `selected-point` 하이라이트 레이어 추가로 우회 |
| URL search params hydration 시 SSR/CSR 불일치 | Medium | `useSearchParams`를 `Suspense`로 래핑, 초기 로드 시 스토어 sync |
| 클러스터링 시 개별 마커 선택 UX 변화 | Low | 클러스터 내 건축물은 줌 인 후 선택하도록 안내 |

---

## Related Documents

- [claude-plan.md](../claude-plan.md) — Section 2 원본 계획
- [index.md](./index.md) — 전체 섹션 인덱스
- [section-04-shops-events.md](./section-04-shops-events.md) — 이 섹션에 의존하는 다음 단계
