# VALIDATION_REPORT_ZH_v1.0.md
## ZH_LANGUAGE_PACK v1.0 검증 보고서

> 검증 대상: `ZH_LANGUAGE_PACK.md`(개정 이력 1.0) | 검증 기준: `VALIDATION_FRAMEWORK.md` Level 0~2 | 검증 방법: 문서 정합성 검토(코드 실행 아님) | 검증일: 2026-07-06

---

## 0. 종합 결과 요약

| Level | 판정 | 비고 |
|---|---|---|
| Level 0 — Schema Validation | **완전 통과** | VI/EN에서 반복됐던 ID 언더스코어 누락·뷰 불일치가 **이번엔 0건**(재발 방지 체크리스트가 실제로 작동) |
| Level 1 — Engine/API Contract Validation | 조건부 통과 | 기존 공통 PENDING(TBD Content 상태) 외 신규 이슈 없음 |
| Level 2 — Language Pack Validation | **완전 통과** | Learning Outcome Scenario 4개 전부 구성 가능, 신규 Concept 0건 |

**결론: ZH_LANGUAGE_PACK v1.0은 Level 0~2 기준으로 Acceptance 가능하다.** 3개 언어(VI/EN/JA) 검증에서 나온 재발 방지 조치(체크리스트·표준 템플릿)가 처음으로 완전히 효과를 낸 사례다.

---

## 1. Level 0 — Schema Validation

| # | 항목 | 결과 |
|---|---|---|
| 1 | Grammar Node ID 형식(`GRAMMAR_ZH_{SLUG}`) | PASS — 21개 전부 준수 |
| 2 | Concept 참조 무결성 | PASS — 21개 노드 전부 존재하는 Concept 참조, 19개 Concept 전부 최소 1회 이상 사용 |
| 3 | Relation 참조 무결성 | PASS — 11개 Relation 전부 존재하는 노드 참조 |
| 4 | PREREQUISITE 단방향성 | PASS — 2건(`HAI_MEI→MEI`, `ZUI→BI`) 전부 UNIDIRECTIONAL |
| 5 | 순환 없음 | PASS — PREREQUISITE 2건이 서로 겹치는 노드 없이 독립적 |
| 6 | Content/Relation ID 언더스코어 보존 | **PASS(전건)** — `HAI_MEI`, `CL_GE`, `CL_ZHI`, `BA_CONFIRM`, `WH_INSITU` 등 복합 SLUG 전부 언더스코어 정상 보존. VI FAIL-1~3, EN 사례와 달리 **이번엔 최초 작성 시점부터 오류 없음** |
| 7 | §4 노드별 관계 표 ↔ §5 마스터 카탈로그 일치 | PASS — 전수 대조 결과 불일치 없음(VI FAIL-4, EN 발견-1과 달리 이번엔 재발 없음) |
| 8 | **Pinyin Normalization 규칙(IDENTIFIER_STANDARD §3 v1.9) 실전 적용** | **PASS** — `GRAMMAR_ZH_LE`가 다음자 해소 3단계(문법 기능 결정→Vocabulary에서 발음 확정→Identifier 생성)를 정확히 거쳐 생성됨. `VOCAB_ZH_LE`/`VOCAB_ZH_LIAO`가 같은 한자·다른 발음의 별개 Lemma로 정확히 분리됨 |

**의미**: 6·7번 항목은 VI(FAIL-1~4)와 EN(발견-1)에서 반복적으로 나왔던 오류 유형이다. 이번에 처음으로 **작성 시점부터 오류가 없었다** — LANGUAGE_PACK_STANDARD §7의 공통 체크리스트가 사후 발견이 아니라 사전 예방으로 작동하기 시작했다는 뜻이다.

---

## 2. Level 1 — Engine/API Contract Validation

기존 공통 PENDING(TBD Content의 API 계약 상태 미정의, VI/EN 보고서 참고)만 남아 있으며, ZH 고유의 신규 이슈는 없다.

---

## 3. Level 2 — Language Pack Validation

### 3.1 Learning Outcome Scenario 검증

| 시나리오 | 필요 노드 | 조합 가능 여부 |
|---|---|---|
| 我吃了饭。 | `GRAMMAR_ZH_LE` | PASS |
| 你在做什么? | `GRAMMAR_ZH_ZAI`, `GRAMMAR_ZH_WH_INSITU` (+ Vocabulary) | PASS |
| 我能买这个吗? | `GRAMMAR_ZH_NENG`, `GRAMMAR_ZH_MA` | PASS |
| 我会去。 | `GRAMMAR_ZH_HUI` | PASS |

4개 전부 PASS. VI(4/4, 1건 PENDING 해소 후 PASS)·EN(4/4, 1건 v1.1로 해소) 대비 **이번엔 처음부터 4/4 전부 통과**했다.

### 3.2 5단계 검토 절차 준수 확인

ZH_LANGUAGE_PACK §1의 5단계(①기존 Concept→②Grammar Node 조합→③Vocabulary→④기존 Relation→⑤신규 제안) 순서가 실제로 지켜졌는지 재확인 — 신규 Concept 제안 0건으로 귀결되었으며, 이는 VI(2)→EN(1)→JA(0)→**ZH(0)**로 이어지는 수렴 추세와 일치한다.

---

## 4. Validation Example — 대표 사례 (요청에 따른 지정)

### 4.1 `吧`의 기능별 노드 분리: Grammar = 기능, 형태 아님

`GRAMMAR_ZH_BA_SUGGEST`(MOOD_IMPERATIVE, "가자")와 `GRAMMAR_ZH_BA_CONFIRM`(PRAGMATICS_CONFIRMATION, "~죠?")은 **완전히 동일한 문자·병음**(吧, ba)을 가지지만 서로 다른 Grammar Node다.

- 같은 형태·다른 기능 → 다른 노드라는 원칙(GRAMMAR_SCHEMA §1)의 실제 사례
- VI `được`(가능/수동), EN `could`(능력/완곡요청)에 이은 **세 번째 언어 간 반복**이자, **한 언어 안에서 이 패턴이 나타난 첫 사례**(두 사례 모두 중국어 한 언어 안에 있음)
- 두 노드 사이에는 의도적으로 **어떤 Relation도 없다** — 완전히 다른 기능이므로 관계를 억지로 만들지 않는다는 원칙(VI `DUOC_ABILITY`/`DUOC_PASSIVE` 사례와 동일)이 재확인됨

**이 사례를 향후 신규 언어 작업자를 위한 대표 예시로 지정한다**: "형태가 같다고 관계가 있는 것은 아니다"를 보여주는 가장 선명한 케이스다.

### 4.2 Pinyin Normalization의 다음자 해소

`了`의 두 발음(le/liǎo)이 `VOCAB_ZH_LE`/`VOCAB_ZH_LIAO`로 정확히 분리된 것은 IDENTIFIER_STANDARD §3(v1.9)의 3단계 절차가 실전에서 처음으로 검증된 사례다. LANGUAGE_VALIDATION_SUMMARY_V1 §10의 Experimental 분류를 Controlled Open으로 승격할지는 이 문서 갱신 시 함께 판단한다.

---

## 5. 다음 단계 권고

1. ZH_LANGUAGE_PACK v1.0을 Acceptance 처리한다.
2. LANGUAGE_VALIDATION_SUMMARY_V1.md를 갱신해 ZH 결과를 Validation Matrix에 반영하고, Pinyin Normalization을 Experimental→Controlled Open으로 승격할지 판단한다.
3. Level 3(Learning Effect)·Level 4(Human)는 이번 범위 밖이며 파일럿 단계에서 다룬다.

---

## 6. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 검증 — Level 0·2 완전 통과(VI/EN 반복 오류 유형 0건), Learning Outcome Scenario 4/4 처음부터 통과, Pinyin Normalization 실전 검증 성공, `吧` 기능 분리를 대표 Validation Example로 지정 |
