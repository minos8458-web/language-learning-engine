# Language Learning Engine (LLE)

An open-source language learning engine focused on grammar automation rather than vocabulary memorization.

The goal of this project is to help learners build practical language skills through reusable grammar structures that can be shared across multiple languages.

## Vision

Traditional language learning often emphasizes memorizing thousands of words.

Language Learning Engine (LLE) takes a different approach by focusing on grammar patterns that learners can automatically apply in real conversations.

The long-term goal is to create a language-independent learning engine that supports multiple languages through reusable grammar graphs and language packs.

## Current Status

This project is currently under active development.

Current work includes:

- Learning theory design
- Grammar schema specification
- Grammar Graph architecture
- English Grammar Graph implementation
- Future multilingual language packs

## Repository Structure

```
docs/
    PROJECT_VISION.md
    LEARNING_THEORY.md
    GRAMMAR_SCHEMA.md

grammar-graphs/
    en/
    vi/
```

## Roadmap

- Build the core Grammar Graph system
- Complete the English grammar graph
- Add Vietnamese language pack
- Develop additional language packs
- Release the first open-source version

## Open Source

This project is released under the MIT License.

Contributions, suggestions, and discussions are welcome.

## Author

Mino TV- **Grammar Graph**: 문법은 고립된 항목이 아니라 노드+관계로 연결된 그래프다. AI는 학습자가 이미 습득한(Practicing 이상) 노드만으로 생성한다.
- **하지 않는 것**: 단어장 앱, 정적 콘텐츠 소비 앱, 게이미피케이션 중심 앱이 되지 않는다.

---

## Tier 구조

```
Tier 0  철학          PROJECT_VISION, LEARNING_THEORY          — WHY/교육이론, 사실상 불변
Tier A  Core Standard 12개 문서                                 — 데이터·ID 계약, v1.0 Frozen
Tier B  Language Pack  VI/EN/JA/ZH_LANGUAGE_PACK                — 언어별 실제 데이터, Controlled Open
Tier C  구현           ENGINE_INTERFACE, API_CONTRACT 등        — HOW, Tier A/B를 소비
Tier D  콘텐츠         VI/EN/JA/ZH_CONTENT                      — 실제 학습 콘텐츠 본문
```

상위 Tier가 하위 Tier에 대해 항상 최종 권위를 갖는다. Tier A는 Freeze됐지만 Tier B/C/D는 계속 확장된다.

---

## 현재 버전

**LLE Core Standard v1.0 — Frozen (2026-07-06)**

| Language Pack | 버전 | 상태 |
|---|---|---|
| VI | v1.2 | Level 0~2 PASS |
| EN | v1.2 | Level 0~2 PASS |
| JA | v1.0 | Level 0~2 PASS |
| ZH | v1.0 | Level 0~2 PASS |

---

## 문서 구조 (Tier A, 의존 순서)

```
PROJECT_VISION → LEARNING_THEORY
   → CONCEPT_SCHEMA → GRAMMAR_SCHEMA → GRAMMAR_GRAPH
   → IDENTIFIER_STANDARD → VALIDATION_FRAMEWORK
   → CONTENT_SCHEMA → PROGRESS_SCHEMA → VOCABULARY_SCHEMA
   → LANGUAGE_PACK_STANDARD
```

각 문서는 "무엇을(Concept/Grammar)", "어떻게 가르칠지(Content)", "지금 뭘 아는지(Progress)", "어떻게 부를지(Identifier)", "어떻게 검증할지(Validation)"를 각각 하나의 SSOT로 분리해서 담당한다. 자세한 개별 문서 설명은 각 파일 서두의 "문서의 지위" 절을 본다.

---

## Language Pack 구조

모든 Language Pack은 `LANGUAGE_PACK_STANDARD.md`가 정의한 동일한 13개 챕터 템플릿을 따른다(Concept 목록 → Grammar Node → Relation → Learning Outcome Scenario → Vocabulary Mapping → Required Content ID → 검증/금지 사항).

**책임 경계**: Language Pack은 "이 언어가 어떤 사실을 갖는가"만 정의한다. Content 본문(Tier D), 학습 정책(LEARNING_PROTOCOL), 사용자 상태(PROGRESS_SCHEMA), 복습 알고리즘(GRAMMAR_GRAPH)은 정의하지 않는다.

**신규 언어 착수 시 5단계 검토(새 Concept를 함부로 만들지 않기 위한 순서)**:
① 기존 Concept로 표현 가능한가 → ② 기존 Grammar Node 조합으로 가능한가 → ③ Vocabulary Layer로 가능한가 → ④ 기존 Relation으로 가능한가 → ⑤ 그래도 안 되면 신규 Concept 제안(Tier B/C 절차, `CONCEPT_SCHEMA.md` §11)

---

## 개발 진행 순서 (지금까지 실제로 진행된 순서)

1. Tier 0(철학) 확정
2. Tier A 11개 문서 순차 작성(위 "문서 구조" 순서, 각 단계마다 필요할 때만 상위 문서로 되돌아가 개정)
3. `LANGUAGE_PACK_STANDARD.md`로 Tier B 템플릿 표준화
4. VI → EN → JA → ZH 순서로 Language Pack 작성 및 개별 검증(`VALIDATION_REPORT_*.md`)
5. `LANGUAGE_VALIDATION_SUMMARY_V1.md`로 4개 언어 종합 검증
6. `PINYIN_NORMALIZATION_STRESS_TEST.md`로 마지막 Experimental 규칙 집중 검증
7. `CORE_STANDARD_V1_FREEZE.md`로 Tier A 전체 Freeze 승인

이 순서 자체가 "Core Standard가 신뢰할 만한 이유"의 증거다 — 언어가 추가될수록 신규 Concept 필요 건수가 2→1→0→0으로 줄었다.

---

## 현재 상태

- Tier 0·A: 완료
- Tier B: 4개 언어 완료, 계속 확장 가능
- Tier C: MVP 브리프 수준(부분 완료)
- Tier D: 구조만 완료, 실 콘텐츠는 초기 단계(대부분 `(TBD)`)

세부 수치·Pending 목록·승인 이력은 전부 `PROJECT_STATUS.md`에 있다(아래 참조).

---

## 다음 단계

1. Tier D 콘텐츠 실제 제작 착수
2. Tier C를 MVP 브리프에서 실제 프로덕션 구현 지시서로 확장
3. 다섯 번째 Language Pack(Concept Frozen 격상의 마지막 근거)
4. Level 3(Learning Effect) 파일럿 준비

우선순위 조정은 다음 세션에서 사용자가 직접 결정한다.

---

## PROJECT_STATUS.md 참조

이 README는 **구조를 이해하기 위한 지도**이고, `PROJECT_STATUS.md`는 **지금 정확히 어디까지 왔는지 보여주는 현황판**이다. 작업을 시작하기 전 반드시 `PROJECT_STATUS.md`를 함께 읽는다 — 이 README는 자주 바뀌지 않지만 그 문서는 작업이 진행될 때마다 갱신된다.

---

## 핵심 문서 링크

| 문서 | 역할 |
|---|---|
| `PROJECT_STATUS.md` | 실시간 현황판(최우선 참조) |
| `PROJECT_VISION.md` | 프로젝트 헌법(WHY) |
| `LEARNING_THEORY.md` | 학습 이론(습득 상태 모델, 5원칙) |
| `CONCEPT_SCHEMA.md` | Universal Concept 표준 |
| `GRAMMAR_SCHEMA.md` | Grammar Node/Relation 표준 |
| `GRAMMAR_GRAPH.md` | Engine 동작 규칙(Learning Flow, Review Cascade 등) |
| `IDENTIFIER_STANDARD.md` | 전체 ID 명명 규칙(Pinyin 정규화 포함) |
| `CONTENT_SCHEMA.md` / `PROGRESS_SCHEMA.md` / `VOCABULARY_SCHEMA.md` | Content/Progress/Vocabulary 표준 |
| `LANGUAGE_PACK_STANDARD.md` | Language Pack 공통 템플릿 |
| `VI_LANGUAGE_PACK.md` 등 | 언어별 실제 데이터 |
| `ENGINE_INTERFACE.md` / `API_CONTRACT.md` | Tier C 계약 |
| `LANGUAGE_VALIDATION_SUMMARY_V1.md` | 4개 언어 종합 검증 결과 |
| `CORE_STANDARD_V1_FREEZE.md` | Freeze 승인 기록 |
