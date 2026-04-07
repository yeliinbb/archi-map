# ADR-001: i18n 라이브러리 선택 — next-intl

- **상태**: accepted
- **날짜**: 2026-04-07
- **태그**: [i18n, architecture, library]

## 문제

archi-map은 영어만 지원하며, 한국어 사용자를 위한 번역이 필요하다. Next.js 16 App Router 기반에서 어떤 i18n 라이브러리를 사용할 것인가?

## 탐색한 옵션들

| 옵션 | 장점 | 단점 |
|------|------|------|
| **next-intl** | App Router 네이티브 지원, Server Component에서 직접 사용 가능, 미들웨어 기반 라우팅, 별도 Suspense 불필요 | careid 프로젝트와 다른 라이브러리 |
| **react-i18next** | careid에서 검증됨, 커뮤니티 크기 큼 | App Router에서 추가 설정 많음, Server Component 지원 제한적, HttpBackend/Suspense 설정 필요 |
| **next-translate** | 경량 | 유지보수 느림, Next.js 최신 버전 호환 불확실 |

## 결정

**next-intl** 채택.

## 근거

- Next.js App Router에 가장 자연스러운 통합 (Server/Client Component 모두 지원)
- 미들웨어 기반 locale 감지 + 라우팅이 내장
- careid의 react-i18next는 Vite + React Router 환경에 최적화된 선택이었고, Next.js App Router에서는 next-intl이 더 적합
- 설정 복잡도가 낮아 개인 프로젝트에 적합

## 결과 & 트레이드오프

- **얻는 것**: 깔끔한 Server Component 번역, `/[locale]/...` 자동 라우팅, 언어 전환 UI
- **잃는 것**: careid와 동일한 라이브러리 사용 불가 (코드 재사용 제한)
- **라우팅 변경**: 기존 `/map/buildings` → `/en/map/buildings`, `/ko/map/buildings`
