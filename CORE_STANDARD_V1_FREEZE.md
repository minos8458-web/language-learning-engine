# CORE_STANDARD_V1_FREEZE.md
## LLE Core Standard v1.0 — Freeze 최종 권고안

> 이 문서는 결정문이 아니라 **권고안**이다. Tier A 전체를 "v1.0"으로 확정할지는 여전히 사용자의 최종 승인 사항이며, 이 문서는 그 승인을 요청하기 위한 근거를 종합한다.

---

## 0. 문서의 지위

- 이 문서가 승인되면 Tier A 문서 12개(PROJECT_VISION, LEARNING_THEORY, LEARNING_PROTOCOL, CONCEPT_SCHEMA, GRAMMAR_SCHEMA, GRAMMAR_GRAPH, IDENTIFIER_STANDARD, VALIDATION_FRAMEWORK, CONTENT_SCHEMA, PROGRESS_SCHEMA, VOCABULARY_SCHEMA, LANGUAGE_PACK_STANDARD)가 공식적으로 "LLE Core Standard v1.0"이라는 하나의 이름으로 묶인다.
- 승인 근거는 전적으로 `LANGUAGE_VALIDATION_SUMMARY_V1.md`(v1.3)와 `PINYIN_NORMALIZATION_STRESS_TEST.md`(v1.0)에 기반한다 — 이 문서는 새로운 근거를 만들지 않고 종합만 한다.

---

## 1. 배경 — 여기까지 온 경로

```
PROJECT_VISION/LEARNING_THEORY (철학)
   ↓
CONCEPT_SCHEMA → GRAMMAR_SCHEMA → GRAMMAR_GRAPH → IDENTIFIER_STANDARD
→ VALIDATION_FRAMEWORK → CONTENT_SCHEMA → PROGRESS_SCHEMA
→ VOCABULARY_SCHEMA → LANGUAGE_PACK_STANDARD  (Core Standard 완성)
   ↓
VI(고립어) → EN(분석어) → JA(교착어) → ZH(고립어+성조+한자) → Pinyin Stress Test
   (네 가지 유형론적 검증 + 다음자 10종 스트레스 테스트)
```

네 개 언어와 한 차례의 집중 스트레스 테스트를 거치는 동안, Core Standard의 **문서 구조 자체**는 단 한 번도 재설계되지 않았다. 바뀐 것은 항상 "그 구조 안에 무엇을 채우는가"였다.

---

## 2. Freeze 대상 범위

| 대상 | Freeze 여부 |
|---|---|
| Tier A 12개 문서의 **필드 구조·엔터티 정의·5-Tier 체계** | Freeze 대상 |
| Tier A 12개 문서의 **ID 형식 큰 틀**(IDENTIFIER_STANDARD §3·§9 등) | Freeze 대상 |
| **Concept 21개 인스턴스, Category 10개** | Freeze 대상 아님 — Controlled Open 유지(Tier B/C 절차로 계속 확장 가능) |
| Tier B(Language Pack), Tier C(구현), Tier D(콘텐츠) | Freeze 대상 아님 — 원래부터 계속 확장되는 영역 |

**핵심**: Freeze는 "Core Standard가 더 이상 안 바뀐다"가 아니라 **"바뀌려면 지금까지와는 다른, 훨씬 무거운 절차를 거쳐야 한다"**는 뜻이다.

---

## 3. 구성 요소별 최종 등급 (LANGUAGE_VALIDATION_SUMMARY_V1 §10 인용)

| 구성 요소 | 등급 | 검증 근거 |
|---|---|---|
| 4축 분리(Grammar/Vocabulary/Content/Progress), 필드 구조, 5-Tier 체계, ID Stability Principle | **Frozen** | 4개 유형론적 언어 전부 무수정 통과 |
| Pinyin 정규화 규칙 | **Frozen(언어 특정)** | 다음자 11건(충돌형 3건 포함) 전부 기존 규칙만으로 해소 |
| Concept 21개/Category 10개 | Controlled Open(Frozen 근접, 1개 언어 부족) | JA·ZH 2연속 신규 0건 |
| Vocabulary `features` 예약 필드 | Controlled Open | JA·ZH 2개 언어 사용 |
| Auxiliary+Pattern 규칙 | Controlled Open | EN·JA 2건, 3번째 미확보 |
| Structure-only SLUG 규칙 | Controlled Open | 4건 전부 Wh-의문문류, 다양성 부족 |

---

## 4. Freeze가 의미하는 것 / 의미하지 않는 것

**의미하는 것**:
- Tier A 문서의 필드 구조·ID 형식·엔터티 경계를 바꾸려면 PROJECT_VISION §6 의사결정 원칙에 준하는 최고 수준 승인이 필요하다(지금까지의 Tier B/C 절차보다 무거움).
- Development·Content 제작팀은 이제 이 구조가 "다음 언어에서 또 바뀔 수도 있다"는 전제 없이 안정적으로 구현·제작을 진행할 수 있다.

**의미하지 않는 것**:
- Concept·Category 목록이 영원히 고정된다는 뜻이 아니다 — Tier B/C 절차는 그대로 살아있다.
- 새로운 Language Pack(다섯 번째 언어 이후)을 못 만든다는 뜻이 아니다.
- 6장에 남은 Open 항목들의 해결을 막는다는 뜻이 아니다 — 그것들은 애초에 Tier B/C 범위였다.

---

## 5. Freeze 이후 변경 절차 (거버넌스, 신설)

Tier A Frozen 구성 요소를 변경하려면 다음을 전부 충족해야 한다.

1. 변경이 필요한 **구체적 근거**(어떤 언어·어떤 사례에서 왜 기존 구조로 안 되는지)를 문서화
2. 최소 2~3개의 대안과 장단점 비교
3. PROJECT_VISION §6 의사결정 원칙에 따른 명시적 사용자 승인
4. 승인 후 해당 Tier A 문서의 개정 이력에 기록하고, Tier B/C에 영향이 있으면 `MIGRATION_GUIDE.md`에 Entry 추가

이 절차는 지금까지 CONCEPT_SCHEMA §11(Tier B/C)이 해왔던 것보다 한 단계 더 무겁다 — Freeze 이전에는 "언어 하나의 필요"로 Tier B 확장이 가능했지만, Freeze 이후 **구조 자체**를 바꾸려면 그 이상이 필요하다.

---

## 6. 남은 Open 항목 (Freeze를 막지 않음)

아래는 계속 살아있는 작업이며, Freeze 여부와 무관하게 Tier B/C 절차로 진행된다.

- Concept 목록 Frozen 격상 여부 — 다섯 번째 언어에서 재확인
- Auxiliary+Pattern·Structure-only SLUG의 사례 다양성 확보
- EN `must`(ALTERNATIVE), ZH `会` 이중 기능(ALTERNATIVE), JA 가능형(食べられる) — 전부 Language Pack 수준
- "복수형(Number/Plural)" Concept 공백 — 필요성 확인 안 됨, 발생 시 Tier B/C로 처리
- `(TBD)` Content의 API 계약상 상태 — API_CONTRACT.md 다음 개정 시 처리
- Vocabulary `features`의 실제 Content 운영 단계 검증 — Tier D 콘텐츠 제작 진행 시 자연 확인

---

## 7. 최종 권고 — **승인됨**

**LLE Core Standard(Tier A 12개 문서)를 v1.0으로 Freeze한다. 사용자 승인 완료(2026-07-06).**

근거를 한 문장으로 요약하면: **네 가지 서로 다른 언어 유형과 한 차례의 집중 스트레스 테스트를 거치는 동안, 구조 자체를 바꿔야 했던 적이 한 번도 없었다.** 바뀐 것은 전부 "그 구조 위에 무엇을 채우는가"였고, 그마저도 언어가 늘수록 빈도가 줄어들었다(2→1→0→0). 이 정도의 반복 검증이면 구조에 대한 신뢰 수준은 충분하다고 판단했고, 사용자가 이를 확정했다.

이 시점 이후 Tier A 변경은 5장의 거버넌스 절차를 따른다.

---

## 8. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 작성 — Freeze 범위·구성요소별 최종 등급·거버넌스 절차·잔여 Open 항목 정리, 최종 권고 제시(승인 대기) |
| 1.1 | 2026-07-06 | **사용자 승인 완료 — LLE Core Standard v1.0 공식 Freeze 확정.** §7 갱신 |
