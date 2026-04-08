<!-- SECTION_MANIFEST
section-01-image-optimization
section-02-map-enhancement
section-03-home-redesign
section-04-shops-events
section-05-diagram-enhancement
section-06-data-pipeline
END_MANIFEST -->

# Implementation Sections Index

## Dependency Graph

| Section | Depends On | Blocks | Parallelizable |
|---------|------------|--------|----------------|
| section-01-image-optimization | - | 03, 04 | Yes |
| section-02-map-enhancement | - | 04 | Yes |
| section-03-home-redesign | 01 | - | No |
| section-04-shops-events | 01, 02 | 06 | No |
| section-05-diagram-enhancement | - | - | Yes |
| section-06-data-pipeline | 04 | - | No |

## Execution Order

1. **Wave 1** (병렬): section-01-image-optimization, section-02-map-enhancement, section-05-diagram-enhancement
2. **Wave 2**: section-03-home-redesign (01 완료 후)
3. **Wave 3**: section-04-shops-events (01 + 02 완료 후)
4. **Wave 4**: section-06-data-pipeline (04 완료 후)

## Section Summaries

### section-01-image-optimization
Next.js Image 컴포넌트 래퍼(OptimizedImage) 생성, 기존 컴포넌트 마이그레이션, ImageMeta 타입에 width/height 추가. 레이아웃 시프트(CLS) 완전 제거 목표.

### section-02-map-enhancement
지도 필터링 UI (도시 드롭다운 + 태그 칩) 추가, DOM 마커를 MapLibre GL symbol layer + 클러스터링으로 마이그레이션. 50개+ 마커 성능 대응.

### section-03-home-redesign
홈 페이지 전면 재디자인. 그리드 기반 히어로 + 건축적 라인 모션 + 진입점 재구성. 포트폴리오적 인상. Featured 섹션은 선택 사항.

### section-04-shops-events
Shops/Events 기본 UI 구축. 시드 데이터 생성, 리스트/상세 페이지, 네비게이션 추가, 지도에 마커 통합.

### section-05-diagram-enhancement
기존 다이어그램 디자인 폴리시 + 레이아웃 아키텍처 리팩토링 + Blueprint(도면풍) 및 Poster(포스터풍) 2차 그래픽 전환 모드 프로토타입.

### section-06-data-pipeline
JSON → Google Sheets 마이그레이션 경로 준비. 스키마 매핑 문서, CSV→JSON 변환 스크립트, 데이터 검증 유틸리티, GitHub Actions 워크플로우 템플릿.
