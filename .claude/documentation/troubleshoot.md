# Troubleshooting 문서

버그를 해결한 후 STAR+ 포맷의 트러블슈팅 문서를 자동 생성합니다.

## 지시사항

**상세 지침은 `.claude/commands/troubleshoot.md` 참조.** 이 파일은 해당 커맨드의 요약본입니다.

1. **현재 대화 분석 및 등급 판정**: 이 대화에서 해결한 문제를 분석하고 등급을 판정합니다.

   | 등급 | 기준 | 깊이 |
   |------|------|------|
   | **Core** | 아키텍처 변경, 크래시/OOM, 프레임워크 내부 동작 분석 | STAR+ 전체 (배경/원인/시행착오/대안검토/해결/결과/배운점) |
   | **Notable** | 의미 있는 버그 수정, 라이브러리 quirk, 여러 파일 수정 | STAR+ 축약 (배경/원인/해결/배운점 필수, 나머지 선택) |
   | **Quick-fix** | 단일 원인, 빠른 해결 | 기존 4단 (증상/원인/해결/교훈) |

2. **YAML frontmatter 작성**:

```yaml
---
category: troubleshooting
date: [오늘 날짜]
author: "@[작성자]"
grade: [Core | Notable | Quick-fix]
impact: [Critical | Major | Minor]
domain: [performance, ui-bug, state-management, api, build, routing, a11y, i18n, css, library-quirk, architecture]
resolution_pattern: [debugging | workaround | architecture-change | library-migration | config-fix | api-pattern | css-technique | state-redesign]
difficulty: [Easy | Medium | Hard | Expert]
tags: [기술 스택 태그들]
highlight: [true | false]
keywords: [핵심 기술 키워드들]
related_issues: [관련 이슈]
related_files: [관련 파일]
---
```

3. **등급별 본문 작성**: `.claude/commands/troubleshoot.md`의 STAR+ 포맷 규칙에 따라 작성합니다.

   핵심 규칙:
   - **배경**: 서사적 문제 묘사 (사용자 시나리오 + 비즈니스 맥락)
   - **Before/After 코드 직후에 기술적 해설 필수**
   - **대안 검토**: 최소 2-3개 비교 (Core/Notable)
   - **결과**: 정량 지표 (Before/After 수치 비교)
   - **배운 점**: 재사용 가능한 구체적 패턴

4. **문서 저장**: `docs/troubleshooting/UPPER_SNAKE_CASE.md`에 저장 후, README.md 테이블에 추가합니다.

## 사용 예시

버그 해결 후 `/troubleshoot` 입력하면 자동으로 STAR+ 포맷 문서가 생성됩니다.
- `/troubleshoot` — 자동 등급 판정
- `/troubleshoot core` — Core 등급 강제
- `/troubleshoot notable` — Notable 등급 강제
- `/troubleshoot quick` — Quick-fix 등급 강제
