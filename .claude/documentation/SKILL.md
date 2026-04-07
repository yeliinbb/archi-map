---
name: documentation
description: 기술 문서를 자동 생성합니다 (ADR, 트러블슈팅)
argument-hint: "{type}"
allowed-tools: Bash, Read, Write, Glob, AskUserQuestion
tags: [documentation, adr, troubleshooting]
category: documentation
complexity: easy
---

# Documentation

기술 문서를 자동 생성합니다.

## 사용 가능한 서브커맨드

| 타입 | 설명 | 예시 |
|------|------|------|
| `adr` | 기술적 결정을 ADR로 기록 | `/documentation adr` |
| `troubleshoot` | 버그 해결 후 트러블슈팅 문서 생성 | `/documentation troubleshoot` |
| `concept` | 기술 개념을 문서화 | `/documentation concept Race Condition` |

## 인자 파싱

`$ARGUMENTS`에서 첫 번째 단어를 타입으로 추출합니다.

```
/documentation adr
→ 타입: adr

/documentation troubleshoot
→ 타입: troubleshoot
```

## 서브커맨드 실행

타입에 따라 해당 상세 문서를 읽고 지침을 따릅니다:

- `adr` → [adr.md](adr.md) 참조
- `troubleshoot` → [troubleshoot.md](troubleshoot.md) 참조
- `concept` → [concept.md](concept.md) 참조

## 문서화 시점

| 상황 | 사용할 커맨드 |
|------|-------------|
| 기술적 결정 후 (라이브러리 선택, 아키텍처 변경 등) | `/documentation adr` |
| 버그 해결 후 | `/documentation troubleshoot` |
| 새로운 기술 개념 학습/설명 후 | `/documentation concept <개념명>` |

## 자동 제안 규칙

Claude는 다음 상황에서 문서화를 제안해야 합니다:

| 상황 | 제안 내용 |
|------|----------|
| **버그 수정 완료** (fix 타입 작업) | "트러블슈팅 문서를 작성하시겠습니까? (`/documentation troubleshoot`)" |
| **새 라이브러리 도입** (yarn add 실행) | "이 라이브러리 선택 이유를 ADR로 남기시겠습니까? (`/documentation adr`)" |
| **아키텍처/구조 변경** | "이 구조적 결정을 ADR로 기록하시겠습니까? (`/documentation adr`)" |
| **두 가지 이상 옵션 비교 후 결정** | "이 결정을 ADR로 남기시겠습니까? (`/documentation adr`)" |
| **기술 개념 설명 후** (React Hook, API 패턴 등) | "이 개념을 문서화하시겠습니까? (`/documentation concept <개념명>`)" |
