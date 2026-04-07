# PR 생성

현재 브랜치의 변경사항을 기반으로 Pull Request를 생성한다.

## 워크플로우

1. **빌드 확인**: `npm run build` 실행, 실패 시 중단
2. **변경사항 분석**: `git diff master...HEAD` 로 전체 변경 파악
3. **PR 생성**: `gh pr create --base master`

## PR 제목 규칙

```
{type}: 한국어 설명 (70자 이내)
```

## PR 본문 템플릿

```markdown
## Summary
- 변경 사항 요약 (1-3개 bullet)

## Changes
- 구체적인 변경 목록

## Screenshots
(UI 변경이 있는 경우)

## Test plan
- [ ] 빌드 성공 확인
- [ ] 로컬에서 주요 기능 동작 확인
```

## 체크리스트

- [ ] `npm run build` 성공
- [ ] 커밋 메시지 컨벤션 준수
- [ ] 불필요한 console.log 제거
- [ ] i18n 번역 키 누락 없음 (en, ko 모두 확인)
