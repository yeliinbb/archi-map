# Archi Curation — 프로젝트 가이드

한국어로 소통합니다.

## 스택

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui, Lucide Icons
- **State**: Zustand
- **Map**: MapLibre GL JS + react-map-gl
- **Diagram**: D3.js
- **Language**: TypeScript 5

## 주요 커맨드

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run lint       # ESLint
```

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router 페이지
│   ├── about/
│   ├── diagram/
│   └── map/          # buildings, architects, cities (+ [slug])
├── components/       # UI 컴포넌트
│   └── layouts/      # SiteHeader, SiteFooter
├── lib/
│   ├── data/         # 건축가/건물/도시 데이터 (data.ts)
│   ├── stores/       # Zustand 스토어
│   └── diagram/      # D3 다이어그램 변환
└── types/            # 타입 정의
```

## 커밋 컨벤션

```
{type}: 한국어 설명

- 변경 사항 1
- 변경 사항 2

Co-Authored-By: Claude <noreply@anthropic.com>
```

**타입**: feat, fix, refactor, style, test, docs, chore

## 브랜치 전략

- `master` — 메인 브랜치 (Vercel 자동 배포)
- `feat/#이슈번호` — 기능 개발
- `fix/#이슈번호` — 버그 수정

## 핵심 규칙

- PR은 `--base master`로 생성
- `npm run build` 성공 확인 후 PR 생성
- 하드코딩 문자열 금지 → i18n 번역 키 사용 (messages/ 참조)
- Tailwind 커스텀 테마 토큰 우선 사용, 하드코딩 색상값 지양

## 참조 파일

- `docs/README.md` — 문서 인덱스
- `docs/prd/` — 제품 요구사항 정의서
- `docs/adr/` — Architecture Decision Records
- `.claude/rules/` — 코딩 컨벤션, 버그 수정 프로토콜
