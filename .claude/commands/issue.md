# GitHub 이슈 생성 + 브랜치

사용자의 요청을 바탕으로 GitHub 이슈를 생성하고, 관련 브랜치를 만든다.

## 워크플로우

1. 사용자에게 이슈 유형 확인 (feat, fix, refactor, docs, chore)
2. 이슈 제목과 설명을 한국어로 작성
3. `gh issue create` 로 이슈 생성
4. 이슈 번호로 브랜치 생성: `{type}/#{issue-number}`
5. 브랜치 체크아웃

## 이슈 본문 템플릿

```markdown
## 설명
{이슈 설명}

## 할 일
- [ ] {구체적인 작업 항목}

## 참고
{관련 파일이나 링크}
```

## 브랜치 네이밍

- `feat/#123` — 새 기능
- `fix/#123` — 버그 수정
- `refactor/#123` — 리팩토링
- `docs/#123` — 문서
- `chore/#123` — 기타

## 실행 예시

```bash
gh issue create --title "feat: 언어 전환 UI 추가" --body "..."
git checkout -b feat/#123
git push -u origin feat/#123
```
