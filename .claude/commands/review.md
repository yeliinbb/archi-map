# 코드 리뷰

현재 브랜치의 변경사항을 리뷰한다. 2개 관점에서 병렬 분석 후 결과를 통합한다.

## 리뷰 관점

### 관점 1: CLAUDE.md 준수 + 컨벤션
- CLAUDE.md와 .claude/rules/ 의 규칙 준수 여부
- 코딩 컨벤션 (네이밍, 파일 크기, JSX 규칙)
- i18n: 하드코딩 문자열 없는지, 번역 키 누락 없는지
- Tailwind: 하드코딩 색상값 없는지

### 관점 2: 버그 탐지 + 품질
- 잠재적 버그 (null/undefined, race condition, 타입 오류)
- 성능 이슈 (불필요한 리렌더, 메모이제이션 누락)
- 보안 (XSS, injection 가능성)

## 출력 형식

```markdown
## 리뷰 결과

### 🔴 Critical (반드시 수정)
- [파일:줄번호] 설명

### 🟡 Suggestion (권장)
- [파일:줄번호] 설명

### ✅ Good
- 잘 된 점
```

## 규칙
- 자신감 70/100 이상인 이슈만 보고
- Critical 이슈는 수정 코드 제안 포함
- 리뷰 대상: `git diff master...HEAD`
