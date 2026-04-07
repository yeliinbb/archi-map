# 데이터 확장 전략

## 소스 수집 파이프라인

```
Liin: 인스타/ArchDaily/유튜브/책에서 건물 발견
→ inbox/에 URL이나 메모 던짐
→ LLM: 건물 정보 리서치 → buildings.json 포맷 변환
→ archi-map repo에 커밋
```

## 데이터 확장 페이스

- 현재: 18개 건물
- 주 2~3개 추가 → 3개월 후 ~50개 → 6개월 후 ~100개
- 100개부터 네트워크 시각화가 의미 있어짐
- 50개 넘어가면 JSON → DB(Supabase) 전환 검토

## 향후 카테고리 확장

- **Shops**: Artek, Magnus Olesen 등 가구/인테리어 숍
- **Events**: 건축 전시, 디자인 페어
