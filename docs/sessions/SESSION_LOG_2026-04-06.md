# Archi Curation — 세션 로그 (2026-04-06~07)

## 세션 요약

이 세션에서 수행한 작업:

1. **세컨드 브레인 구축** — Obsidian Vault "Liin Registry"를 LLM-Wiki 구조로 재편 (68개 파일 → wiki 12페이지)
2. **데이터 교체** — 기존 건축가(Zaha Hadid, Gaudí 등) → Liin이 좋아하는 4명(Bo Bardi, SANAA, Siza, Pawson) + 건물 18개
3. **기능 구현** — Google Maps 링크, OpenStreetMap 임베드, Wikimedia 이미지(15/18), 홈페이지 카운트 동적화
4. **Vercel 배포** — https://archi-curation-map.vercel.app
5. **고도화 계획 수립** — Phase 1(인터랙티브 맵), Phase 2(다이어그램), Phase 3(폴리시)

### 분리된 문서 안내
- 사용자 프로필 → `.claude/.../memory/user_profile.md`
- Obsidian Vault 경로 → `.claude/.../memory/reference_obsidian_vault.md`
- 데이터 확장 전략 → `docs/DATA_STRATEGY.md`
- 기술 구현 계획 (정본) → `docs/playful-wishing-wave.md`

---

## 숨겨진 연결점 분석 (wiki 전체 교차 분석)

wiki 12페이지를 전부 읽고 발견한 7가지 연결점:

1. **세운상가 네트워크 = CRDT** — 분산된 제조업자 협력 시스템 = 중앙 서버 없는 데이터 일관성
2. **"힘빼면 잘하고 힘주면 망한다" vs Archi Map PRD** — PRD가 이미 오버스펙, MVA로 시작 필요
3. **건축 페르소나 = 마케팅 리서치 = UX 리서치** — 동일 방법론, 다른 이름
4. **"비장소" × CareID DPP** — DPP는 비장소적 경험, SDUI에 적용 가능
5. **PLEATSMAMA 오디오 큐레이션 = ii DJ** — 소리로 공간 설계하는 동일 능력
6. **"분리의 미학" vs "경계를 넘나드는 사람"** — 모순이 아니라 "분리를 통해 연결하는 사람"
7. **이미 에디터가 될 소재는 충분** — 월 1편 에세이로 지금 시작 가능

### 반복 패턴 3가지
1. "번역자" 정체성 — 매번 A를 B로 옮기는 위치
2. "과정 > 결과" + "빠른 결과에서 성취감" 이중성
3. "수평적 네트워크" 집착 — 세운상가, ii, FSD, SSOT

### Liin의 반응
- 1번(CRDT)에 흥미 — 하지만 CRDT 개념 학습이 먼저 필요
- 2번(Archi Map MVA)에 공감 — 실행으로 이어짐
