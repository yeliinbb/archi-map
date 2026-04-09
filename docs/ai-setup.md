# AI 큐레이션 캡션 연동 가이드

다이어그램에서 선택한 건축물에 대한 AI 큐레이션 캡션을 생성하는 기능.

---

## 개요

```
사용자가 다이어그램에서 "AI Caption" 클릭
    ↓
Server Action → Google Gemini API 호출
    ↓
건축물 + 건축가 정보 → 큐레이션 캡션 텍스트 생성
    ↓
다이어그램 하단에 표시 (건축 전시 월텍스트 스타일)
```

- **API**: Google Gemini 2.0 Flash (무료)
- **한국어/영어 자동 전환**: 사이트 언어 설정에 따라 캡션 언어 결정
- **서버 사이드**: API Key가 클라이언트에 노출되지 않음 (Next.js Server Action)

---

## 1. Google Gemini API Key 발급

1. [Google AI Studio](https://aistudio.google.com/apikey)에 접속합니다
2. **Get API key** 클릭
3. Google 계정으로 로그인
4. **Create API key** 클릭
5. 생성된 API Key를 복사합니다

### 무료 티어 제한

| 항목 | 제한 |
|------|------|
| 요청 수 | 15 RPM (분당 15회) |
| 일일 한도 | ~1,500 요청/일 |
| 토큰 | 100만 토큰/분 |
| 비용 | 무료 (신용카드 불필요) |

개인 프로젝트 또는 소규모 사이트에 충분합니다.

---

## 2. 환경 변수 설정

### 로컬 개발

`.env.local` 파일에 추가합니다:

```env
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz
```

### Vercel 배포

Vercel Dashboard → 프로젝트 → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Gemini API Key |

**중요**: Environment Variables 추가 후 **재배포**가 필요합니다.

---

## 3. 사용 방법

### 다이어그램 페이지에서

1. 지도 또는 건축물 리스트에서 건축물 2개 이상 선택
2. **Generate Diagram** 클릭 → 다이어그램 페이지로 이동
3. 다이어그램 하단의 **✨ AI Caption** 버튼 클릭
4. 몇 초 후 큐레이션 캡션이 표시됩니다

### 모바일에서

- 툴바의 ✨ 아이콘 버튼 클릭
- 캡션은 툴바 아래 배너로 표시됩니다

---

## 4. 캡션 스타일

생성되는 캡션은 **건축 전시 월텍스트** 스타일입니다:

> 이 컬렉션은 콘크리트가 단순한 구조 재료를 넘어 시적 표현의 매개체가 되는 순간들을 모았다. 안도 다다오의 빛의 교회와 춤토르의 테르메 발스는 각각 빛과 물이라는 자연 요소를 통해 콘크리트의 정신적 차원을 탐구한다.

- 2~3 문장
- 선택한 건축물들의 **테마적 연결**을 설명
- 사이트 언어에 따라 한국어/영어로 자동 전환

---

## 5. 기술 구조

### 파일 구조

```
src/lib/ai/gemini.ts          — Gemini API 호출 유틸리티
src/app/actions/generate-caption.ts  — Server Action (캡션 생성)
```

### 동작 흐름

1. 클라이언트: `DiagramView` → `handleGenerateCaption()` 호출
2. Server Action: `generateCurationCaption(buildings, architects, locale)`
3. 프롬프트 조립: 건축물 목록 + 건축가 목록 + 언어 지정
4. Gemini API 호출 → 캡션 텍스트 반환
5. 클라이언트: 캡션 상태 업데이트 → UI 표시

### API Key 보안

- API Key는 **서버에서만** 사용됩니다 (Server Action)
- `.env.local`에 저장, 클라이언트 번들에 포함되지 않음
- `GEMINI_API_KEY` (NEXT_PUBLIC_ 접두사 없음)

---

## 6. 커스터마이징

### 프롬프트 수정

`src/app/actions/generate-caption.ts`에서 프롬프트를 수정할 수 있습니다:

```typescript
const prompt = `You are a knowledgeable architecture curator...`;
```

### 다른 AI 모델로 교체

`src/lib/ai/gemini.ts`의 API URL과 요청 형식을 변경하면 다른 모델로 교체 가능합니다:

- **Groq** (LLaMA 3.3): OpenAI 호환 API 형식
- **OpenRouter**: 여러 무료 모델 지원
- **Mistral**: 유럽 기반 모델

---

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| 버튼 클릭 시 아무 반응 없음 | `GEMINI_API_KEY` 미설정 | `.env.local`에 키 추가 후 `npm run dev` 재시작 |
| `API key not valid` | 잘못된 키 | [AI Studio](https://aistudio.google.com/apikey)에서 새 키 생성 |
| `429 Too Many Requests` | 요청 한도 초과 | 1분 대기 후 재시도 (15 RPM 제한) |
| 캡션이 영어로만 나옴 | locale 전달 오류 | 사이트 언어 설정 확인 (KO/EN 토글) |
| Vercel에서만 안 됨 | 환경 변수 미설정 | Vercel Dashboard → Environment Variables 확인 + 재배포 |

---

## 참조

- [Google AI Studio](https://aistudio.google.com) — API Key 관리
- [Gemini API 문서](https://ai.google.dev/gemini-api/docs)
- [Gemini 무료 티어 제한](https://ai.google.dev/gemini-api/docs/pricing)
