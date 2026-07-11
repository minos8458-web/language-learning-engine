# LEARNING_PROTOCOL.md
## LLE Learning Protocol (Tier A — Core Standard)

> Grammar Graph가 **무엇을** 배울지를 정의했다면, 이 문서는 **언제·무엇을·어떤 순서로·얼마나** 배울지를 정의한다. 이 문서는 Engine을 정의하지 않는다 — Engine들을 어떤 순서와 정책으로 사용해야 장기 기억이 형성되는지만 정의한다.

문서 계층(정책 권위 기준): `PROJECT_VISION.md` → `LEARNING_THEORY.md` → **`LEARNING_PROTOCOL.md`** → `CONCEPT_SCHEMA.md` / `GRAMMAR_SCHEMA.md` / `GRAMMAR_GRAPH.md` / `IDENTIFIER_STANDARD.md` / `VALIDATION_FRAMEWORK.md`

이 문서는 GRAMMAR_GRAPH.md·ENGINE_INTERFACE.md·API_CONTRACT.md가 이미 정의한 Engine·API 이름을 **참조**한다. 정책적 권위는 이 문서가 위에 있지만(LEARNING_THEORY의 연장), 구체적 메커니즘은 그 문서들이 정의한 것을 그대로 쓴다.

---

## 0. 문서의 지위

- **Tier A 배치 근거**: LEARNING_THEORY.md가 학습 원칙(WHY/WHAT)을 정의했다면, 이 문서는 그 원칙을 세션·하루·주간·장기 단위의 구체적 정책(WHEN/HOW MUCH/WHAT ORDER)으로 번역한다.
- **언어 독립성**: 이 문서는 베트남어·영어·일본어·중국어 등 어떤 Language Pack에도 동일하게 적용된다. 언어별 특수성은 이 문서에 절대 스며들지 않는다.
- **Conversation Engine 관련 범위 제한**: Conversation Engine은 아직 ENGINE_INTERFACE.md에 정의되어 있지 않다. 이 문서는 "Conversation으로 언제 진입하는가"라는 **정책 조건만** 정의하며, Conversation Engine 자체의 책임·인터페이스는 별도 Tier C 문서에서 다룬다.
- **핵심 우선순위**: 이 문서 전체에서 **Learning Effect(장기 기억 형성)가 사용자 경험(편의성·재미)보다 우선한다.** 세션이 짧거나 지루하게 느껴지더라도, 이 문서가 정의한 순서(특히 Review 우선순위)를 사용자 경험을 이유로 바꾸지 않는다.

---

## 1. 문서의 목적

| 문서 | 답하는 질문 |
|---|---|
| GRAMMAR_GRAPH.md | 무엇을 배울 수 있는가(구조), 각 Engine은 무엇을 하는가(메커니즘) |
| **LEARNING_PROTOCOL.md** | 언제, 무엇을, 어떤 순서로, 얼마나 배우는가(정책) |

이 문서는 하나의 세션(짧게는 몇 분)부터 장기(몇 달)까지, 시간 단위별로 정책을 정의한다. 모든 정책은 LEARNING_THEORY.md의 다섯 원칙(Active Recall/Spaced Repetition/Interleaving/Elaboration/Generation Practice) 중 최소 하나를 실행하기 위해 존재해야 한다.

---

## 2. 세션 시작 프로토콜

세션이 시작되면 아래 순서를 반드시 거친다. 순서를 건너뛰거나 뒤바꾸지 않는다.

1. **Learning State Assessment**(3장) 실행 — 현재 상태 스냅샷 확보
2. **오늘의 학습 목표 결정**(4장) — 스냅샷을 근거로 오늘 무엇을 할지 결정
3. **Session Budget**(5장) 산정 — 결정된 목표를 시간 예산에 맞게 배분
4. 배분된 순서대로 활동 시작(Review → 신규 도입 → Interleaving → Conversation, 6~9장)

---

## 3. Learning State Assessment

세션 전략을 결정하기 전, 아래 항목을 조회해 **학습 상태 스냅샷**을 만든다. 이 스냅샷은 저장되는 엔터티가 아니라 **조회 시점에 계산되는 값**이다(Coverage/Depth와 동일한 원칙, 두 번째 진실 소스를 만들지 않는다).

| 항목 | 조회 방법 |
|---|---|
| 진행 중인 Review Queue | Review Engine `get_cascade` 누적 결과 + 정기 복습 스케줄 도달 노드 목록 |
| 현재 Progress 상태 분포 | Progress Engine `get_progress`를 노드별로 집계 — 6단계 상태별 노드 수 |
| 최근 학습 이력 | 마지막 세션 이후 경과 시간, 최근 세션 빈도 |
| (향후) 시간 예산 | 사용자가 오늘 쓸 수 있는 시간 — 현재는 수집하지 않음, 수집 UI가 생기면 5장의 입력으로 연결 |
| (향후) 피로도 | 실시간 피로 신호 — 현재는 수집하지 않음, 센서·행동 신호 기반 측정이 생기면 5장·13장의 입력으로 연결 |

**원칙**: "(향후)" 항목은 지금 구현하지 않지만, 이 문서의 정책 구조(4~5장)는 이 값들이 나중에 들어와도 정책을 다시 설계할 필요 없이 입력값만 추가되도록 설계되어야 한다.

---

## 4. 오늘의 학습 목표 결정

3장의 스냅샷을 근거로 오늘의 활동 구성을 결정한다.

- **Review 최우선 원칙**: Review Queue가 존재하면, 그 크기와 무관하게 신규 문법 도입보다 항상 우선한다(LEARNING_THEORY §4 간격 반복 원칙 재확인). Review를 미루는 것은 이미 형성된 기억의 소실을 방치하는 것이므로 어떤 이유로도 신규 도입이 이를 대체할 수 없다.
- **동시 진행 노드 수 제한**: `INTRODUCED`/`STUDYING` 상태에 동시에 있을 수 있는 노드 수를 제한한다(과부하 방지, PROJECT_VISION §1.1 (2) "문법의 고립화" 실패 패턴과 반대로 가되 동시에 너무 많은 문법을 한꺼번에 벌여놓지 않기 위함). 정확한 상한값은 HOW 단계(개인화 파라미터)에서 정의하며, 이 문서는 "상한이 있어야 한다"는 원칙만 강제한다.
- **오늘 다룰 활동 유형 결정**: Review 대상 확정 → 신규 도입 여지 확인(6장 조건) → Interleaving 필요 여부(8장 조건) → Conversation 자격 여부(9장 조건) 순으로 오늘의 활동 구성을 확정한다.

---

## 5. Session Budget

Session Budget은 **고정된 비율이 아니라, 사용 가능한 시간과 3장의 상태 스냅샷에 따라 동적으로 조정되는 정책**이다.

### 5.1 배분 우선순위(고정)

1. **Review** — 항상 최우선으로 시간을 배정한다.
2. **신규 문법 도입** — Review 배정 후 남은 시간에서, 4장의 동시 진행 제한 내에서 배정한다.
3. **Interleaving 연습** — 그 다음 남은 시간에서 배정한다.
4. **Conversation** — 가장 낮은 우선순위. 9장의 진입 조건을 충족하고 시간이 남을 때만 배정한다.

이 우선순위 자체(1→2→3→4)는 고정이며 어떤 이유로도 순서를 바꾸지 않는다. **바뀌는 것은 각 항목에 실제로 배정되는 시간·분량뿐이다.**

### 5.2 동적 조정 규칙

| 상황 | 조정 |
|---|---|
| 시간 예산이 매우 적음 | Review만 수행하고 나머지는 이번 세션에서 생략(다음 세션으로 이월) — "짧아도 복습은 반드시"라는 최소 보장 |
| 시간 예산이 충분함 | 4개 항목 모두에 배정하되, 1→4 우선순위에 따라 비중은 Review가 가장 크고 Conversation이 가장 작다 |
| Review Queue가 비정상적으로 큼(오래 접속 안 함) | 신규 도입·Interleaving·Conversation을 이번 세션에서 전부 생략하고 Review에 전량 배정할 수 있다 |
| Review Queue가 없음(드묾) | 신규 도입에 더 많은 시간 배정 가능 |

**정확한 비율 공식(예: "Review 40%, 신규 30%...")은 이 문서에서 확정하지 않는다.** 이는 HOW 단계(개인화·튜닝)의 영역이다. 이 문서가 강제하는 것은 5.1의 우선순위 순서와, 그 배분이 상황에 따라 동적으로 조정되어야 한다는 원칙뿐이다.

---

## 6. 새 문법 도입 조건

아래 조건을 **모두** 만족해야 신규 노드를 `NOT_INTRODUCED → INTRODUCED`로 전환할 수 있다(API_CONTRACT §4.3 `record_explicit_study` 호출 자격 조건).

- 5장 Session Budget에서 신규 도입 몫이 배정되어 있을 것
- 해당 노드의 모든 `PREREQUISITE` 선행 노드가 이미 `MASTERED` 이상일 것(GRAMMAR_GRAPH §3 정합성과 별개로, 학습 순서 정책 차원의 게이트)
- 4장의 동시 진행 노드 수 제한을 초과하지 않을 것

---

## 7. Review 진입 조건

두 가지 경로로만 진입한다.

1. **정기 스케줄 도달**: 간격 반복 스케줄(LEARNING_THEORY §4 원칙 1)에 따라 다음 복습 시점(`next_review_at`)에 도달한 노드
2. **실수 처리 루프에 의한 즉시 진입**: 세션 중 인출 실패가 발생해 GRAMMAR_GRAPH §4.2 루프가 Review Cascade를 생성한 경우

두 경로 모두 5장 우선순위 1번(Review 최우선)의 적용을 받는다.

---

## 8. Interleaving 진입 조건

**두 개 이상의 노드가 동시에 연습 대상일 때는 예외 없이 Interleaving Engine을 거친다**(LEARNING_THEORY §4 원칙 3, 교차 강제). 연습 대상이 단 하나뿐인 극초반(전체 진행 노드가 1개)에만 예외적으로 Interleaving을 생략한다 — 교차시킬 대상 자체가 없기 때문이다.

---

## 9. Conversation 진입 조건

Conversation Engine 자체는 정의되어 있지 않으므로, 여기서는 **진입 가능 여부를 판단하는 정책 조건만** 정의한다.

- 오늘의 Review Queue가 이미 처리되었을 것(5장 우선순위 재확인 — Review를 제치고 Conversation으로 가지 않는다)
- `PRACTICING` 이상 노드가 최소 기준 개수 이상 존재할 것(생성 연습의 최소 재료 요건, GRAMMAR_GRAPH §6.1과 별개로 "자유 회화"라는 더 개방적인 활동을 위한 추가 여유분 — 정확한 기준 개수는 HOW 단계)
- Session Budget에 Conversation 몫이 실제로 남아 있을 것(5.1 우선순위 4번)

이 조건을 충족하지 못하면 Conversation은 이번 세션에서 열리지 않으며, 사용자에게 "아직 준비되지 않음"으로 노출되는 것이 아니라 **그냥 오늘 활동 목록에 나타나지 않는다**(존재하지 않는 선택지를 실패로 보여주지 않는다).

---

## 10. Automatic 판정 이후의 행동

`AUTOMATIC`에 도달한 노드는 **활성 로테이션(신규 도입·Interleaving)에서 제외**되고, 아주 낮은 빈도의 **유지 복습(maintenance review)**만 받는다.

- 유지 복습에서 실패하면 즉시 `PRACTICING`으로 퇴행하고 활성 로테이션에 복귀한다(LEARNING_THEORY §2 상태 퇴행 원칙)
- Automatic 노드를 필요 이상으로 반복시키는 것은 시간 낭비이며 Learning Effect를 저하시킨다(17장 금지 사항과 직결)

---

## 11. 하루 학습 프로토콜

한 세션(하루 단위로 간주) 안에서의 순서는 다음과 같다.

```
Learning State Assessment (3장)
   ↓
오늘의 학습 목표 결정 (4장)
   ↓
Session Budget 산정 (5장)
   ↓
Review 수행 (7장)
   ↓
신규 문법 도입 (조건 충족 시, 6장)
   ↓
Interleaving 연습 (8장)
   ↓
Conversation (조건 충족 시, 9장)
   ↓
Reflection (15장)
   ↓
Progress Update 마무리 (14장)
   ↓
세션 종료 (16장)
```

---

## 12. 주간 학습 프로토콜

- **Concept Category 균형 점검**: 한 Concept Category(예: TENSE)에만 학습이 편중되지 않았는지 주 단위로 확인한다. 편중이 발견되면 다음 주 신규 도입 순서에서 다른 Category를 우선 배정한다.
- **자기보고 Confidence 체크포인트**: LEARNING_THEORY §5.3이 정의한 "주요 상태 전이 시점" 체크포인트 중 최소 1회는 주 단위로 발생하도록 유도한다(API_CONTRACT §4.5).
- **주간 추세 점검**: 이번 주 Review 실패율이 지난 주보다 늘었는지 등, VALIDATION_FRAMEWORK의 Benchmark 사고방식을 개인 학습자 단위로 축소 적용해 확인한다. 급격한 악화가 감지되면 다음 주 신규 도입량을 줄이는 방향으로 4장 정책이 조정될 수 있다.

---

## 13. 장기 학습 프로토콜

- **30일 유지율 점검**: PROJECT_VISION §3의 "문법 노드 습득 지속률" 지표를 30일 단위로 확인한다.
- **확장 세트 노출 시점**: Language Pack의 상위 버전(예: VI_LANGUAGE_PACK v1.1의 확장 노드)을 언제 사용자에게 노출할지는, 현재 세트(v1.0)의 핵심 노드들이 충분히 `MASTERED` 이상에 도달했는지를 근거로 판단한다.

---

## 14. Progress Update 시점

프로토콜의 각 단계는 API_CONTRACT.md의 특정 쓰기 API 호출 시점과 정확히 대응한다.

| 프로토콜 단계 | 대응 API |
|---|---|
| 신규 문법 도입(6장) | `record_explicit_study` |
| 인출 시도 제출(7~9장 전반) | `record_attempt` |
| 주간 체크포인트(12장) | `record_self_reported_confidence` |
| Learning State Assessment(3장) | `get_progress`, `get_concept_coverage_depth` (조회 전용) |

이 매핑 밖의 시점에 임의로 Progress를 갱신하지 않는다(ENGINE_INTERFACE §11 단일 쓰기 경로 원칙 재확인).

---

## 15. Reflection

세션 종료 직전, 아래 항목을 정리해 사용자에게 보여준다.

- **오늘 어려웠던 문법**: 이번 세션 중 실수 처리 루프(GRAMMAR_GRAPH §4.2)에 진입했던 노드 목록 요약
- **Confidence 변화**: 자기보고가 있었다면 그 변화폭, 없었다면 행동 추론 기반 confidence의 변화 요약
- **추천 Review**: 다음 세션에서 우선 배치될 노드 예고(다음 세션의 7장 진입에 참고자료로만 쓰임)
- **다음 세션 추천 시점**: 간격 반복 스케줄에 근거한 권장 재접속 시점

**원칙**: Reflection은 **새로운 저장 엔터티를 만들지 않는다.** 자기보고 Confidence만 14장 매핑에 따라 `record_self_reported_confidence`로 기록되고, 나머지(어려웠던 문법 목록, 추천 Review, 다음 세션 시점)는 기존 Progress/Review 데이터를 조합해 그 자리에서 계산되는 **요약 화면**일 뿐이다.

---

## 16. 종료 조건

세션은 아래 중 하나로 종료된다.

- Session Budget(5장)이 소진됨
- 사용자가 직접 종료함
- (향후) 피로 신호가 감지됨(3장의 향후 확장 항목과 연결)

**제약**: 실수 처리 루프(GRAMMAR_GRAPH §4.2)가 진행 중일 때는 세션을 강제 종료하지 않는다. 현재 진행 중인 활동(문항 하나, Cascade 처리 하나)은 완료한 뒤에 종료 절차(15장 Reflection → 16장 종료)로 넘어간다.

---

## 17. 금지 사항

- Review Queue를 무시하고 신규 문법 도입을 우선하는 것(5.1 위반)
- 세션 길이 압박을 이유로 실수 처리 루프(GRAMMAR_GRAPH §4.2)를 생략하는 것
- 두 개 이상의 노드가 있는데도 Interleaving 없이 단일 노드만 반복시키는 것(8장 위반)
- 9장의 Conversation 진입 조건을 충족하지 않은 상태에서 자유 회화를 시작하는 것
- `AUTOMATIC` 노드를 활성 로테이션에 계속 포함시켜 불필요하게 반복시키는 것(10장 위반)
- **사용자 경험(세션을 짧고 재미있게)을 이유로 Review 우선순위를 낮추는 것** — 이 문서 전체의 핵심 원칙(0장) 위반
- 14장 매핑 밖의 시점에 Progress 데이터를 임의로 갱신하는 것
- Reflection 단계에서 불필요한 새 저장 엔터티를 만드는 것(15장 원칙 위반)

---

## 18. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 0.1 | 2026-07-06 | 목차 승인, Tier A 배치 확정, Conversation Engine 범위 제한(정책 조건만 정의) 합의 |
| 1.0 | 2026-07-06 | 본문 최초 작성 — 세션 시작~종료 전체 프로토콜, Learning State Assessment·Session Budget·Reflection 3개 장 신규 추가 반영. Review 최우선 원칙을 5장 배분 우선순위로 고정. 하루/주간/장기 프로토콜과 Progress Update 시점 매핑, 금지 사항 정의 |
