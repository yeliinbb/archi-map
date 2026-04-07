# Concept 문서

기술 개념을 문서화합니다.

## 지시사항

1. **개념명 파악**: `$ARGUMENTS`에서 개념명을 추출합니다.
   - 예: `/documentation concept Race Condition` → 개념명: `Race Condition`
   - 예: `/documentation concept TanStack Query AbortController` → 개념명: `TanStack Query AbortController`

2. **현재 대화 분석**: 이 대화에서 설명된 개념을 분석합니다.
   - 기본 정의
   - 사용 이유/필요성
   - 코드 예시
   - 프로젝트에서의 적용 방법

3. **문서 생성**: `docs/concepts/` 폴더에 아래 형식으로 문서를 생성합니다.
   - **파일명**: `UPPER_SNAKE_CASE.md`
   - **예시**: `RACE_CONDITION.md`, `TANSTACK_QUERY_ABORT_CONTROLLER.md`

4. **템플릿 형식**:

```markdown
---
category: concepts
tags: [React, TypeScript]
---

# [개념명]

| 항목 | 내용 |
|------|------|
| **날짜** | [오늘 날짜 YYYY-MM-DD] |
| **카테고리** | [React / TypeScript / 네트워크 / 상태관리 / 빌드 등] |
| **관련 라이브러리** | [TanStack Query, Zod, React Hook Form 등] |

## 개념

> [한 줄 정의]

[상세 설명]

## 왜 필요한가?

[이 개념이 필요한 이유, 해결하는 문제]

## 기본 사용법

\`\`\`typescript
// 기본 사용 예시 코드
\`\`\`

## 프로젝트에서의 사용 예시

[프로젝트 내 실제 적용 방법 또는 적용 예정인 방법]

\`\`\`typescript
// 프로젝트 맥락에서의 코드 예시
\`\`\`

## 주의사항

- [주의할 점 1]
- [주의할 점 2]

## 관련 문서

- [내부 문서 링크 또는 외부 참고 자료]
```

5. **README 업데이트**: `docs/concepts/README.md`의 개념 목록 테이블에 새 항목을 추가합니다.

6. **완료 후**: 생성된 문서 경로를 알려주세요.

## 카테고리 가이드

| 카테고리 | 포함 내용 |
|----------|----------|
| **React** | Hooks, Concurrent Features, 렌더링 패턴 등 |
| **TypeScript** | 타입 시스템, 유틸리티 타입, 타입 가드 등 |
| **상태관리** | Jotai, TanStack Query, 전역 상태 패턴 등 |
| **네트워크** | API 호출, AbortController, 캐싱 등 |
| **폼** | React Hook Form, Zod, 유효성 검사 등 |
| **성능** | Web Worker, 메모이제이션, 최적화 기법 등 |
| **빌드** | Vite, 번들링, 환경 설정 등 |

## 사용 예시

대화에서 개념 설명 후 `/documentation concept <개념명>` 입력:

```
/documentation concept Race Condition
/documentation concept React Hook Form shouldUnregister
/documentation concept TanStack Query AbortController
```
