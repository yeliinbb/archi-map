# Data Pipeline — JSON ↔ Google Sheets 스키마 매핑

## 개요

현재 데이터는 `src/lib/data/*.json`에서 관리된다. 향후 Google Sheets로 전환 시 이 문서를 참조한다.

## Sheets 탭 구조

| 탭 | 엔티티 | JSON 파일 |
|---|---|---|
| Buildings | Building | buildings.json |
| Architects | Architect | architects.json |
| Cities | City | cities.json |
| Shops | Shop | shops.json |
| Events | Event | events.json |

## 필드 매핑 규칙

### GeoLocation (중첩 객체 → 평탄화)
```
{ "location": { "lat": 35.67, "lng": 139.65 } }
→ location_lat, location_lng
```

### ImageMeta[] (배열 → 인덱스 접미사, 최대 5개)
```
image_1_src, image_1_alt, image_1_width, image_1_height, image_1_credit
image_2_src, ...
```

### Tag[] (객체 배열 → 쉼표 구분)
```
tags = "Brutalism:brutalism, Concrete:concrete"
```

### DateRange (Event)
```
date_start, date_end
```

### string[] (notableWorks)
```
notableWorks = "Chapel of Light, Row House"
```

## 엔티티별 열 목록

### Buildings
`id`, `slug`, `name`, `nameKo`, `architectId`, `cityId`, `year`, `description`, `address`, `location_lat`, `location_lng`, `googleMapsUrl`, `tags`, `status`, `typology`, `website`, `image_1_src`, `image_1_alt`, `image_1_width`, `image_1_height`, `image_1_credit`, ... `image_5_*`

### Architects
`id`, `slug`, `name`, `nameKo`, `nationality`, `birthYear`, `deathYear`, `bio`, `tags`, `status`, `website`, `notableWorks`, `portrait_src`, `portrait_alt`, `portrait_width`, `portrait_height`, `portrait_credit`

### Cities
`id`, `slug`, `name`, `nameKo`, `country`, `description`, `location_lat`, `location_lng`, `tags`, `status`, `image_1_src`, ... `image_5_*`

### Shops
`id`, `slug`, `name`, `nameKo`, `cityId`, `category`, `description`, `address`, `location_lat`, `location_lng`, `tags`, `status`, `website`, `openingHours`, `image_1_src`, ... `image_5_*`

### Events
`id`, `slug`, `title`, `titleKo`, `cityId`, `description`, `date_start`, `date_end`, `venue`, `address`, `location_lat`, `location_lng`, `tags`, `status`, `website`, `image_1_src`, ... `image_5_*`

## 마이그레이션 절차

1. Google Sheets에 위 탭 구조로 시트 생성
2. `scripts/csv-to-json.ts`로 변환 테스트
3. `npm run validate`로 무결성 검증
4. `.github/workflows/sync-data.yml` 활성화 (secrets 설정)
