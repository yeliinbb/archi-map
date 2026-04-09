# Google Sheets 연동 가이드

Archi Curation의 데이터를 Google Sheets에서 관리하고, 사이트에 동기화하는 방법.

---

## 개요

```
Google Sheets (데이터 입력/편집)
    ↓  npm run sync-sheets
CSV 다운로드 → JSON 변환 → 검증
    ↓
src/lib/data/*.json (사이트 데이터)
```

- **방식**: 공개 시트 + API Key (서비스 계정 불필요)
- **비용**: 무료
- **개인 계정 의존 없음**: 프로젝트 단위로 동작

---

## 1. CSV 파일 준비

현재 JSON 데이터를 Google Sheets에 Import할 수 있는 CSV로 내보냅니다.

```bash
npm run export-csv
```

→ `data-csv/` 폴더에 5개 CSV 파일이 생성됩니다:
- `buildings.csv`, `architects.csv`, `cities.csv`, `shops.csv`, `events.csv`

---

## 2. Google Sheets 생성

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트를 생성합니다
2. 스프레드시트 이름을 `Archi Curation Data`로 지정합니다
3. 각 CSV 파일을 탭으로 Import합니다:
   - **File → Import → Upload** → `buildings.csv` 선택
   - Import location: **Insert new sheet** 선택
   - Separator type: **Comma**
   - **Import data** 클릭
4. 생성된 탭 이름을 **Buildings**로 변경합니다
5. 나머지 4개 파일도 동일하게 반복합니다:
   - `architects.csv` → **Architects** 탭
   - `cities.csv` → **Cities** 탭
   - `shops.csv` → **Shops** 탭
   - `events.csv` → **Events** 탭
6. 처음에 자동 생성된 빈 시트(`Sheet1`)는 삭제합니다

### 탭 이름 규칙

탭 이름은 정확히 아래와 같아야 합니다 (대소문자 구분):

| 탭 이름 | 엔티티 |
|---------|--------|
| Buildings | 건축물 |
| Architects | 건축가 |
| Cities | 도시 |
| Shops | 숍 |
| Events | 이벤트 |

---

## 3. 시트 공유 설정

API Key 방식은 시트가 공개되어야 합니다.

1. 우측 상단 **Share** 버튼 클릭
2. **General access** → **Restricted** → **Anyone with the link** 으로 변경
3. 권한: **Viewer** (보기 전용)
4. **Done** 클릭

### 시트 ID 확인

URL에서 시트 ID를 추출합니다:

```
https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
                                       ↑ 이 부분이 시트 ID
```

---

## 4. Google API Key 발급

1. [Google Cloud Console](https://console.cloud.google.com)에 접속합니다
2. 프로젝트를 생성하거나 기존 프로젝트를 선택합니다
3. 좌측 메뉴 **APIs & Services → Library**
4. **Google Sheets API** 검색 → **Enable** 클릭
5. 좌측 메뉴 **APIs & Services → Credentials**
6. **+ CREATE CREDENTIALS → API key** 클릭
7. 생성된 API Key를 복사합니다

### (선택) API Key 제한

보안을 위해 API Key 사용 범위를 제한할 수 있습니다:

1. 생성된 Key 옆 **Edit** (연필 아이콘) 클릭
2. **API restrictions → Restrict key**
3. **Google Sheets API**만 선택
4. **Save**

---

## 5. 환경 변수 설정

### 로컬 개발

`.env.local` 파일에 추가합니다:

```env
GOOGLE_SHEETS_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ
GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz
```

### Vercel 배포

Vercel Dashboard → 프로젝트 → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `GOOGLE_SHEETS_ID` | 시트 ID |
| `GOOGLE_API_KEY` | API Key |

### GitHub Actions

Repository → Settings → Secrets and variables → Actions → New repository secret:

| Secret Name | Value |
|-------------|-------|
| `GOOGLE_SHEETS_ID` | 시트 ID |
| `GOOGLE_API_KEY` | API Key |

---

## 6. 동기화 실행

### 로컬에서 수동 동기화

```bash
# 전체 동기화 (Sheets 가져오기 → CSV → JSON 변환 → 검증)
npm run sync-sheets

# 개별 단계 실행
npm run fetch-sheets        # Sheets → CSV 다운로드
npx tsx scripts/csv-to-json.ts  # CSV → JSON 변환
npm run validate            # 데이터 검증
```

### GitHub Actions로 자동 동기화

1. GitHub Repository → **Actions** 탭
2. **Sync Data from Google Sheets** 워크플로우 선택
3. **Run workflow** 클릭
4. 엔티티 선택 (all / buildings / architects 등)
5. 자동으로 데이터를 가져와 검증 후 PR을 생성합니다

---

## 7. 데이터 편집 워크플로우

### 일상 운영

1. Google Sheets에서 데이터 수정 (행 추가/편집/삭제)
2. `status` 열을 `published`로 설정해야 사이트에 노출
3. `npm run sync-sheets` 또는 GitHub Actions 실행
4. 변환된 JSON을 확인하고 커밋/푸시

### 새 건축물 추가 예시

Buildings 탭에 새 행을 추가합니다:

| id | slug | name | architectId | cityId | year | ... |
|----|------|------|-------------|--------|------|-----|
| bld-new-one | new-building | New Building | arch-tadao-ando | city-osaka | 2024 | ... |

### 필드 규칙

- **tags**: `Brutalism:brutalism, Concrete:concrete` 형식 (label:slug 쌍, 쉼표 구분)
- **location**: `location_lat`, `location_lng` 두 열로 분리
- **images**: `image_1_src`, `image_1_alt`, ... `image_5_*` (최대 5개)
- **status**: `draft`, `published`, `archived` 중 하나

---

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| `403 Forbidden` | 시트가 비공개 | 시트 공유 설정 → "Anyone with the link" |
| `400 Bad Request` | 탭 이름 불일치 | 탭 이름이 정확히 Buildings, Architects 등인지 확인 |
| `API key not valid` | API Key 오류 | Cloud Console에서 Sheets API 활성화 확인 |
| 검증 실패 | 데이터 형식 오류 | `npm run validate` 에러 메시지 확인 |

---

## 참조

- [스키마 매핑 문서](data-pipeline.md) — JSON ↔ Sheets 필드 매핑 규칙
- [Google Sheets API 문서](https://developers.google.com/sheets/api)
