# AI_INTEGRATION_BRIEF.md
## LLE Production AI 통합 지시서 (Tier C, Production Track 4/5)

> 이 문서는 코드가 아니라 **지시서**다. `ENGINE_INTERFACE.md`가 정의한 AI Generation Engine의 책임(사다리 1~2단계)과 `API_CONTRACT.md`의 `generate_combination`/`generate_single_node` 계약을 전제로, "실제 AI 호출을 어떻게 하고 그 결과를 어떻게 검증하는가"만 다룬다.

---

## 0. 문서의 지위

- Tier C, Production 문서 로드맵의 4번 문서.
- `GRAMMAR_GRAPH.md` §6.1의 필터 파이프라인 순서를 재정의하지 않는다. stages 1~4의 실행 경계만 명시하며, stage 5 품질 비교형 스코어링은 2차 실제 LLM milestone로 유보한다. 이 문서는 그 파이프라인에 사후 검증 게이트를 연결한다.
- "AI는 이미 학습한 문법만으로 생성한다"는 PROJECT_VISION 수준의 불변 원칙을 실제로 **검증 가능하게** 만드는 것이 이 문서의 핵심 목적이다.

---

## 1. 전제 — 확정된 결정

| 영역 | 결정 |
|---|---|
| 제약 강제 방식 | 프롬프트 제약 + 사후 검증 병행(C) |
| 위반 처리 | 재시도 후 사다리 강등 |

---

## 2. AI 호출 메커니즘

### 2.1 구조화 출력

LLM 호출은 JSON Schema를 강제하는 구조화 출력(tool use/function calling 등 제공자의 구조화 출력 기능)을 사용한다. 자유 텍스트를 정규식으로 파싱하지 않는다. Provider가 schema에 맞는 구조를 만들지 못한 structured-output parse failure는 §6의 technical failure로 처리한다.

### 2.2 신뢰 경계

`answer_key`는 provider가 유일한 출처다. AI Generation Engine은 이를 임의 추론·합성하거나 테스트 fixture에서 production 값으로 주입하지 않는다. `generated_text` 검증 실패 시 질문과 `answer_key`를 함께 폐기하고 재생성한다. `self_reported_node_ids`는 **교차확인 힌트일 뿐 판정·출력 근거가 아니며** Layer 2 이후 노출하지 않는다. 실제 검증은 항상 §5의 독립적 절차로 수행한다.

### 2.3 Canonical node source

결과 `grammar_node_ids`는 provider 응답에서 파생하지 않는다. Provider 호출 전에 AI Generation Engine의 `select_generation_candidates` / `selectGenerationCandidates(pool, userId, language, generationMode, targetConceptId)`가 Graph/Progress canonical 데이터로 확정한 정렬·중복 제거 node 목록을 Layer 2 candidate에 그대로 사용한다. `generateCombination`과 `generateSingleNode`는 이 ID를 재선택·재필터·재정렬하지 않는다.

### 2.4 Provider raw exact schema 및 1차 Mock 기준

1차 Mock provider 응답도 production provider와 동일한 아래 exact schema를 사용한다. 세 필드는 모두 required이고 top-level `additionalProperties:false`다.

```
{
  generated_text: required non-empty/non-whitespace string,
  answer_key: required non-empty/non-whitespace string,
  self_reported_node_ids: required string[]
}
```

Provider raw에는 `source`, `content_id`, `content_type`, `difficulty`, `author`, `meta_language`, `human_reviewed`가 없다. Mock fixture가 이 필드들을 production 값으로 대신 주입해서는 안 되며, 누락·추가·형식 위반은 §6의 provider schema violation 경로로 검증한다. 이 첫 Mock milestone은 GRAMMAR_GRAPH §6.1 stage 5의 복수 생성 결과 품질 비교형 스코어링을 수행하거나 수행했다고 주장하지 않는다.

### 2.5 표층 변주

`ENGINE_INTERFACE.md` §12가 AI Generation Engine을 Stateless로 규정했으므로("이전 생성 이력을 스스로 기억하지 않는다"), 반복을 피하려면 **호출자(Generation Engine)가 매 호출마다 최근 예문을 프롬프트에 함께 전달**해야 한다. Generation Engine은 planning이 반환한 ID와 exact 동일한 `grammarNodeIds`로 Content Engine의 `get_recent_generated_content(pool, grammarNodeIds, language)`를 호출하고, Content Engine은 요청 node set 전체를 포함하는 `AI_GENERATED` Content를 `created_at DESC`, 동률 `content_id ASC`, fixed limit 5로 반환한다. 정상 0건은 `[]`이며 raw SQL/DB 직접 조회는 금지한다.

Generation Engine은 반환 배열을 추가·삭제·재정렬하거나 필드를 다시 만들지 않고 `generateCombination(pool, language, grammarNodeIds, recentGeneratedContent)` 또는 `generateSingleNode(pool, language, grammarNodeIds, recentGeneratedContent)`에 그대로 전달한다. AI Generation Engine은 배열과 각 item의 exact `{content_id,media_assets,created_at}` 3-key shape를 검증한다. 이 배열은 stage 4 prompt-only 입력이며 candidate 선택·node 검증·출력 근거가 아니다.

---

## 3. 프롬프트 설계 원칙

- **화이트리스트 방식**: 프롬프트에는 "이 문법들을 써라"만 명시하고 "이 문법들은 쓰지 마라"는 나열하지 않는다. 언어 전체의 금지 목록을 매번 나열하는 것은 비효율적이고, 화이트리스트 쪽이 §5의 사후 검증(허용 목록과의 대조)과도 대칭적으로 맞아떨어진다.
- **화이트리스트 내용**: 대상 노드(조합이면 전부)의 `label`, `surface_forms`, 대표 예문 1~2개.
- **어휘는 제약하지 않는다**: `VOCABULARY_SCHEMA.md` §0의 원칙대로 어휘는 열린 집합이다. 프롬프트가 통제하는 것은 문법 구조뿐이며, 어휘 선택은 자연스러움 범위 내에서 AI에 맡긴다.
- **반복 회피**: §2에서 조회한 최근 예문 목록을 "이전에 이미 나온 예문과 겹치지 않게" 지시로 포함한다.

---

## 4. 파이프라인상 위치

```
selectGenerationCandidates
stage 1 eligible pool → stage 2 mode/Concept/ALTERNATIVE 필터
→ stage 3 최근 exact 조합 count 및 element-wise lexicographic tie-break
   ↓
Generation Engine: 같은 grammar_node_ids로 getRecentGeneratedContent
   ↓ (반환 배열을 변경 없이 전달)
generateCombination / generateSingleNode
stage 4 Layer 1 provider prompt: {grammarNodeIds, recentGeneratedContent}
→ {generated_text, answer_key, self_reported_node_ids}
   ↓
사후 검증(§5, 이 문서가 신설하는 게이트) ── 실패 → §6
   ↓
Layer 2: {candidate:{grammar_node_ids, media_assets, type_specific_metadata}}
   ↓ Generation Engine
Content Engine save_generated_content
   ↓ canonical save projection
Layer 3: {content, content_id, source, ladder_step}
```

사후 검증은 기존 필터 파이프라인을 대체하지 않고 그 사이에 삽입되는 별도 단계다. Layer 1의 `generated_text`는 Layer 2의 유일한 TEXT/PRIMARY `media_assets[0].asset_ref`로, `answer_key`는 QUIZ `type_specific_metadata.answer_key`로 전달된다. AI Generation Engine은 exact `{candidate:object|null}`까지만 만들고 저장하지 않는다. Generation Engine이 Content Engine의 save API를 호출하며, save 반환 projection을 재계산 없이 Layer 3 `content`로 사용한다.

GRAMMAR_GRAPH §6.1 stage 5의 품질 비교형 스코어링은 복수 실제 생성 결과를 비교해야 하므로 **2차 실제 LLM milestone**으로 유보한다. 첫 Mock milestone에는 placeholder API나 가짜 점수를 추가하지 않으며, 별도 clarification 전에는 구현 범위로 간주하지 않는다. §5.2의 별도 LLM 기반 문법 위반 검증은 하나의 생성 결과를 검증하는 gate로서 이 comparative scoring과 다른 책임이다.

---

## 5. 사후 검증 알고리즘

검증 비용과 위반 가능성이 사다리 단계별로 다르므로 차등 적용한다.

### 5.1 Rule 기반 1차 검증 (모든 단계 공통)

같은 언어의 **허용되지 않은** 모든 Grammar Node의 `surface_forms`를 생성된 텍스트에서 스캔한다. 하나라도 매치되면 위반으로 판정한다. 빠르고 비용이 낮아 항상 먼저 실행한다.

### 5.2 LLM 기반 2차 검증 (사다리 1단계·조합 생성에만 적용)

조합 생성은 여러 노드가 상호작용해 Rule 기반 매칭으로 못 잡는 미묘한 위반(의도치 않은 문법 혼입)이 생길 가능성이 더 높다. 별도의 LLM 호출로 "이 문장이 다음 허용 라벨 목록 `{labels}` 외의 문법 구조를 쓰고 있는가?"를 묻는다.

**독립성 원칙**: 이 검증 호출은 생성에 쓴 것과 **다른 프롬프트 프레이밍**을 쓴다 — "네가 방금 만든 문장이 맞는지 확인해봐"가 아니라 "이 문장을 분석해서 사용된 문법을 나열하라"는 제3자적 프레이밍이다. 같은 맥락으로 자기 확인을 시키면 생성 시의 편향을 그대로 반복할 위험이 있다.

단일 노드 생성(사다리 2단계)은 대상이 하나뿐이라 위반 가능성이 상대적으로 낮으므로 Rule 기반만 적용해 검증 비용을 아낀다.

---

## 6. 실패 처리

실패 유형별 retry와 ladder 처리를 분리한다.

1. **Provider technical failure**: timeout, network, structured-output parse failure는 같은 provider 호출을 1회 즉시 재시도한다. 재시도도 실패하면 throw하지 않고 다음 ladder 단계로 강등한다.
2. **Provider schema/rule/content constraint violation**: 최초 생성 1회 후 위반 내용을 반영해 최대 2회 재생성한다(총 최대 3회). 전부 실패하면 다음 ladder 단계로 강등하고 내부 reason은 public payload에 노출하지 않는다.
3. **Candidate 부족**: 정상 조건 미충족이며 error가 아니다. 재시도·재생성 없이 `{candidate:null}`로 다음 ladder 단계에 넘긴다.
4. **`save_generated_content` 실패**: 내부 재시도 없이 즉시 throw한다. 다음 ladder 단계로 강등하지 않는다.
5. **PRE_MADE read technical failure**: Generation Engine이 Content Engine `get_content` 호출을 1회 즉시 재시도하고 재실패하면 throw한다. Provider technical failure와 달리 ladder step 4로 강등하지 않는다.
6. **PRE_MADE 정상 empty**: error가 아니며 이 경우에만 ladder step 4 NO_CONTENT로 정상 강등한다.

강등은 `DOMAIN_LOGIC_BRIEF.md` §8의 4단계 사다리를 그대로 따른다. 구현 예정 설정 의미는 `AI_GENERATION.defaultMetaLanguage="KO"`, `AI_GENERATION.technicalRetryCount=1`, `AI_GENERATION.maxRegenerationAttempts=2`다. 모두 후속 구현 milestone의 provisional/tunable 값이며 이번 문서 patch는 `engineConfig.js`를 변경하지 않는다. Provider timeout milliseconds는 adapter HOW로서 이번 clarification에서 숫자를 확정하지 않는다.

**노출 원칙**: 실패·재시도·강등 이력은 로그로만 남기고, 사용자에게는 최종 결과와 `ladder_step`만 노출한다(`API_CONTRACT.md` §12 알고리즘 비노출 원칙과 동일). 별도의 DB 테이블을 새로 만들지 않는다 — 애플리케이션 로그/관측성 도구로 충분하며, 이 이력은 사용자별 영속 데이터가 아니라 운영 디버깅용이기 때문이다.

---

## 7. API 매핑

| API | 입력/역할 | 출력·검증 |
|---|---|---|
| `select_generation_candidates` / `selectGenerationCandidates(pool,userId,language,generationMode,targetConceptId)` | Generation Engine만 호출. stages 1~3에서 eligible pool·Concept/ALTERNATIVE·최근 시도 조합을 적용 | exact `{grammar_node_ids:string[]\|null}`; mode 1은 2개, mode 2는 1개; dedupe·사전순 정렬 |
| `generate_combination` / `generateCombination(pool,language,grammarNodeIds,recentGeneratedContent)` | 사다리 1단계. planning의 조합을 그대로 사용하고 최근 Content는 prompt-only | Rule 기반 + LLM 기반 검증, exact `{candidate}` |
| `generate_single_node` / `generateSingleNode(pool,language,grammarNodeIds,recentGeneratedContent)` | 사다리 2단계. planning의 단일 node를 그대로 사용하고 최근 Content는 prompt-only | Rule 기반 검증, exact `{candidate}` |

Planning은 Progress Engine의 `get_recent_attempted_combinations(pool,userId,language)`가 반환한 최근 20개 content-linked attempt만 사용한다. 후보마다 dedupe·사전순 정렬된 배열의 원소 단위 exact equality로 동일 조합 횟수를 세고, 최소 횟수 후보를 우선하며 동률은 정렬 배열의 원소별 lexicographic 순서로 해소한다. join·JSON 등 직렬화 문자열을 비교 키로 사용하지 않는다. AI Generation Engine은 Progress SQL이나 Content 조회를 직접 소유하지 않는다.

두 generation API 모두 `grammarNodeIds`의 non-empty string, 중복 없음, mode별 길이를 검증하고 Graph `get_node_language_and_concepts`로 존재성과 요청 language 일치를 확인한다. 성공 시 exact `{candidate:{grammar_node_ids,media_assets,type_specific_metadata}}`, 재생성 소진 시 exact `{candidate:null}`을 반환한다. top-level exact key는 `candidate` 하나고 candidate의 exact keys는 세 개이며 각 object는 `additionalProperties:false`다. `media_assets`는 정확히 1개의 TEXT/PRIMARY item, QUIZ `type_specific_metadata.answer_key`는 required다. Layer 2에 `content_id`는 없다. 상위 판단·save·다음 사다리 단계는 Generation Engine의 몫이다(`ENGINE_INTERFACE.md` §6).

---

## 8. 정합성 확인

`DATA_PERSISTENCE_BRIEF.md`와 대조해 `content.created_at` 누락을 발견해 v1.4로 보완했다(§2). 그 외 `ENGINE_INTERFACE.md`·`API_CONTRACT.md`·`GRAMMAR_GRAPH.md`와의 구조적 불일치는 발견되지 않았다.

---

## 9. 다음 단계

5번 문서 `CLIENT_BRIEF.md`로 진행한다 — API를 소비하는 클라이언트 재설계, `LEARNING_PROTOCOL.md`의 흐름을 실제 화면으로 매핑한다. Production 문서 로드맵(0~5)의 마지막 문서다.

---

## 10. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-07 | 최초 작성 — 구조화 출력 기반 AI 호출 메커니즘, 표층 변주를 위한 최근 예문 조회, 화이트리스트 방식 프롬프트 설계 원칙, 사후 검증 알고리즘(Rule 기반 전 단계 공통 + LLM 기반 조합 생성 전용, 독립적 프레이밍 원칙), 기술적 실패/제약 위반 구분과 재시도·사다리 강등 처리, `generate_combination`/`generate_single_node` API 매핑 정의. `content.created_at` 누락을 발견해 `DATA_PERSISTENCE_BRIEF.md` v1.4로 보완 |
| 1.1 | 2026-07-22 | AC-017 Tier C Architecture Clarification 누적 correction — 기존 provider raw·검증·retry·save 경계를 유지하면서 `selectGenerationCandidates` stages 1~3, Progress 최근 시도 조합 tie-break, generation API의 preselected ID·최근 Content stage 4 입력 계약을 확정. 품질 비교형 stage 5는 2차 실제 LLM milestone로 유보하고 첫 Mock 범위에서 제외했다. Provider timeout 수치는 미확정, 코드·DB·Tier A 불변 |
