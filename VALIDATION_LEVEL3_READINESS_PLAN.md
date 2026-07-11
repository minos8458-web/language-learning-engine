# VALIDATION_LEVEL3_READINESS_PLAN.md
## LLE Production — Validation Level 3 진입 준비 계획

Current GitHub Status: Code Rebuild Required
Historical Status: Phase 2 completed in lost session codebase

**작성일**: 2026-07-09 (v1.0)
**개정**: 2026-07-09 (v1.1) — `CLIENT_BRIEF.md`·`CONTENT_PRODUCTION_STANDARD.md` 확보, AC-004 Resolved 반영
**개정**: 2026-07-09 (v1.2) — `cascade_jobs` 워커 구현 완료 반영
**개정**: 2026-07-10 (v1.3) — Tier D 콘텐츠(VI/EN/JA/ZH) 실제 적재 완료 반영, Relation 수치 54→52 정정
**전제**: Phase 2 공식 완료(미노 승인, 2026-07-09). 이 문서는 코드 작업 계획이 아니라 **Validation Level 3 진입을 위해 무엇을, 어떤 순서로 확보해야 하는지**만 정리한다.

> ⚠️ **2026-07-11 현재 상태 정정**: 이 문서가 서술하는 "Blocker 0건, 175/175 PASS, Tier D 적재 완료" 상태는 **당시 세션의 코드베이스(`/home/claude/lle-production/`) 기준이며, 그 코드베이스는 GitHub에 push되지 않은 채 세션 종료로 유실되었다.** 아래 본문은 "과거 세션 보고 기준 목표 상태"로서 재구현의 Definition of Done 근거로는 유효하지만, **현재 GitHub 코드 기준으로는 175/175도, Tier D 적재도, `validateLanguagePack` 통과도 전부 미검증(재현 전) 상태다.** 특히 §2 표의 Relation 수치(52개)는 이 문서 v1.3 정정치이며, `VALIDATION_LEVEL3.md` 원문은 아직 옛 값(54개)을 그대로 갖고 있다는 점도 별도로 확인됐다(`CODE_REBUILD_GAP_REPORT.md` §5.1). 상세 경위는 `CODE_REBUILD_GAP_REPORT.md`, 재구현 계획은 `CODE_REBUILD_PLAN.md` 참고. 본문은 과거 기록 그대로 보존한다(정정하지 않음).

---

## 1. 현재 완료 상태

| 구성 요소 | 상태 | 근거 |
|---|---|---|
| Graph / Progress / Content / Review Engine | 완료(AC-004 반영으로 Content Engine `explanation_level` 실필터링 포함) | `PHASE_2_COMPLETION_REPORT.md` §1, IMPLEMENTATION_NOTES.md |
| AI Generation Engine | 완료(Mock 기반) | 동 §1, §7-5 |
| Generation / Interleaving Engine | 완료 | 동 §1 |
| Learning Flow Engine | 완료(5/5 API, `start_session` 포함, SELF/TRANSFER 실규칙 활성화) | 동 §1 |
| API Layer | 완료(`auth/convert` 제외) | 동 §3 |
| DB Migrations | 완료(12개) | `db/migrations/` |
| 전체 회귀 테스트 | **175/175 PASS** | 최신 실행 결과(Tier D 적재 후) |
| AC Backlog | AC-001·002·003·004·005·009·011 Resolved, AC-006·007·010 Open(전부 Non-blocking) | `ARCHITECTURE_CLARIFICATION_BACKLOG.md` |

**결론**: 알고리즘·API 계약 층위는 fixtures 기준으로 완결되어 있다. Validation Level 3는 이 위에 **실제 콘텐츠·인프라**를 얹는 단계다 — 문서 확보는 대부분 끝났고(`CLIENT_BRIEF.md`·`CONTENT_PRODUCTION_STANDARD.md` 완료), 남은 것은 데이터·인프라·Architecture 결정 소수다.

---

## 2. Validation Level 3 진입 조건 (`VALIDATION_LEVEL3.md` 원문 기준)

| 조건 | 원문 근거 | 현재 충족 여부 |
|---|---|---|
| Tier D 콘텐츠 제작 완료(85 Node·255 Content·4개 언어) | §0 "전제" | **충족(2026-07-10)** |
| 외부 API 5개 전부 구현 | §2.1 | **충족** |
| Engine 8개 전부 구현 | §2.1 | 충족 |
| `CLIENT_BRIEF.md` §2 클라이언트 흐름 확보 | §2.1 | **충족**(2026-07-09) |
| Grammar Relation 52개(VI16+EN14+JA11+ZH11, 정정된 실측치) 데이터 존재 | §2.1 | **충족(2026-07-10)** |
| `CONTENT_PRODUCTION_STANDARD.md` 제작 원칙 확보 | §4.1 | **충족**(2026-07-09) |

**6개 조건 전부 충족.**

---

## 3. 남은 Blocker 목록

### Validation Level 3 Blocker

| # | 항목 | 유형 | 상태 |
|---|---|---|---|
| ~~1~~ | ~~Tier D 실제 콘텐츠 적재(85 Node·255 Content·4개 언어)~~ | 데이터 | **해소(2026-07-10) — 21 Concept·85 Node·52 Relation·255 Content·12 Vocabulary 전량 적재, 4개 언어 전부 validateLanguagePack 통과, 175/175 회귀 PASS** |
| ~~2~~ | ~~`CLIENT_BRIEF.md` 확보~~ | 문서 | **해소(2026-07-09) — 서버 측 추가 구현 불필요 확인** |
| ~~3~~ | ~~`CONTENT_PRODUCTION_STANDARD.md` 확보~~ | 문서 | **해소(2026-07-09) — 적재 방식 확정, AC-004 재부상 후 해소까지 완료** |
| ~~4~~ | ~~`cascade_jobs` 워커 구현~~ | 인프라 | **해소(2026-07-09) — FOR UPDATE SKIP LOCKED 기반, 173/173 회귀 PASS** |
| ~~5~~ | ~~AC-011(SELF/TRANSFER 진단 키) 확정~~ | Architecture 결정 | **해소(2026-07-09)** |
| 6 | 실제 LLM 호출 여부 결정 | Architecture 결정 + Integration 작업 | 열림 |
| ~~7~~ | ~~AC-004(`explanation_level` 저장 위치, Blocker 1 선행 조건으로 재분류됐던 항목)~~ | Architecture 결정 | **해소(2026-07-09) — `content.explanation_level` 컬럼 확정·활성화·테스트 완료** |

**남은 Blocker: 0건. Architecture 결정 1건**(실 LLM 호출 여부)만 남았다.

### Non-blocking / Later

- AC-006(`target_concept_id` 존재 검증)
- AC-007(Interleaving 카테고리 과반 제약)
- AC-010(AI 생성 콘텐츠 `meta_language` 근거)
- `POST /auth/convert`(OAuth 계정 전환)

이 4건은 Validation Level 3 §12 Pass/Fail 기준 어디에도 직접 걸리지 않는다 — 병행 확인만 하고 진입을 막지 않는다.

---

## 4. 각 Blocker 해결 순서

```
완료됨
  ├─ CLIENT_BRIEF.md 확보 ────────────── 완료, 서버 변경 없음 확인
  ├─ CONTENT_PRODUCTION_STANDARD.md 확보 ─ 완료, 적재 방식 확정
  ├─ AC-004 확정 ──────────────────────── 완료, content.explanation_level 활성화
  ├─ AC-011 확정 ──────────────────────── 완료, SELF/TRANSFER 실규칙 활성화
  └─ Blocker 4: cascade_jobs 워커 구현 ── 완료(2026-07-09), FOR UPDATE SKIP LOCKED
                                          기반 동시 실행 방지, 173/173 회귀 PASS

(이전 단계 전부 완료 — Blocker 1 Tier D 콘텐츠 적재도 2026-07-10 완료)

마지막 단계 (별도 트랙)
  └─ Blocker 6: 실 LLM 호출 여부 결정 ── Mock 경계가 이미 명확히 분리되어 있어
                                          (generatorClient/llmVerifier 주입점) 다른
                                          Blocker와 독립적으로 진행 가능. Mock 기반으로
                                          Validation Level 3 상당 부분(§5~9)은 이미
                                          실행 가능 — §6.2·§10의 "실제 생성 시나리오"
                                          조건만 이 결정에 의존
```

---

## 5. 필요한 문서 목록

| 문서 | 상태 |
|---|---|
| ~~`CLIENT_BRIEF.md`~~ | **완료(2026-07-09)** |
| ~~`CONTENT_PRODUCTION_STANDARD.md`~~ | **완료(2026-07-09)** |
| ~~AC-011 관련 Architecture 결정문~~ | **완료(2026-07-09)** — `error_attributed_node_id` |
| ~~AC-004 관련 Architecture 결정문~~ | **완료(2026-07-09)** — `content.explanation_level` 컬럼 |
| 실 LLM 호출 관련 결정문(Integration 승인) | 열림 — Mock→실호출 전환 범위·비용 승인 필요 |

**문서 확보는 사실상 완료됐다.** 남은 것은 Architecture 결정 1건(LLM)과 실제 콘텐츠 파일이다.

---

## 6. 필요한 데이터 적재 목록 (Tier D, `VALIDATION_LEVEL3.md` §2.1·§4.2 + `CONTENT_PRODUCTION_STANDARD.md` 기준)

| 언어 | Grammar Node | Content | 비고 |
|---|---|---|---|
| VI | 24 | 72 | Relation 16개 |
| EN | 21 | 63 | Relation 15개, 시나리오4는 `go`→`work` 대체(부분 실현, Non-blocking) |
| JA | 19 | 57 | Relation 12개, 시나리오2는 `する` 대체(부분 실현), RARERU 五段活用 Content Gap 1건(Non-blocking) |
| ZH | 21 | 63 | Relation 11개 |
| **합계** | **85** | **255** | Relation 총 **52개**(실측 정정), `explanation_level` 전부 `BEGINNER`(AC-004 결정문) — **전부 적재 완료(2026-07-10)** |

**적재 방식(`CONTENT_PRODUCTION_STANDARD.md` 확보로 확정)**:
1. 언어별 단일 파일(`VI_CONTENT.md` 등, §2.1) + 대응 `LANGUAGE_PACK.md`를 파싱하는 **데이터 시딩 스크립트** 작성(스키마 마이그레이션 아님 — 기존 `concepts`/`grammar_nodes`/`grammar_relations`/`content` 테이블에 데이터만 채움).
2. 콘텐츠는 `PREREQUISITE` 위상정렬 순서로 파일에 배치돼 있음(§2.2) — 적재 스크립트가 이 순서를 그대로 신뢰 가능.
3. §4.1 체크리스트를 적재 검증에 반영: 노드 참조 유효성·위상정렬 위반은 기존 `graphEngine.validateLanguagePack`(순환 검증) 로직을 재사용, `explanation_level` 필수 여부는 `contentEngine.validateExplanationLevel`(AC-004 해소분, 이미 구현됨)을 그대로 재사용.
4. Content Lifecycle(Draft→Reviewed→Canonical→Deprecated, §5)은 기존 `human_reviewed`/`is_canonical`/`is_active` 3필드로 이미 스키마 지원됨 — 적재 시 Tier D 파일에 기록된 상태값을 그대로 반영.
5. §4.1 원칙("새 데이터를 만들지 않는다")에 따라 적재 스크립트는 파싱·검증·삽입만 하고 콘텐츠 내용 자체를 생성하지 않는다.

**남은 유일한 전제 조건**: 실제 `VI/EN/JA/ZH_CONTENT.md`·`LANGUAGE_PACK.md` 파일 확보(적재 방식 자체는 이미 설계 가능한 상태).

---

## 7. 필요한 인프라 작업

| 작업 | 설명 | 소속 |
|---|---|---|
| ~~`cascade_jobs` 워커~~ | **완료(2026-07-09)** — `src/worker/cascadeJobsWorker.js`, `PENDING` 폴링·`FOR UPDATE SKIP LOCKED`·재시도·`FAILED` 전환 전부 구현·테스트 완료 | 8개 Engine에 속하지 않는 별도 인프라 컴포넌트 |
| 실 LLM 클라이언트 구현 | `aiGenerationEngine.js`의 `generatorClient`/`llmVerifier` 기본 Mock을 실제 API 호출로 교체(주입 지점은 이미 준비됨) | Integration 트랙, Blocker 6 결정에 종속 |
| ~~Tier D 데이터 시딩 스크립트~~ | **완료(2026-07-10)** — `db/seedTierD.js`, `db/tierD/parse*.js`, 멱등성 확인(3회 재실행), 전체 검증 통과 | Blocker 1 실행 도구 |
| (선택) 배포 환경 시크릿 관리 | `src/api/tokens.js`의 `LLE_JWT_SECRET` 등 개발 기본값을 실제 배포에서는 환경 변수로 교체 | 이번 계획 범위 밖, 참고용 |

**Client 관련 구현**: 필요 없음. `CLIENT_BRIEF.md`는 지시서이며(§0), Validation Level 3의 E2E 시나리오는 이 문서가 정의한 호출 순서를 API 레벨 통합 테스트로 재현하는 것으로 충분하다 — 실제 프론트엔드를 만들 필요가 없다.

---

## 8. Validation 실행 순서 (`VALIDATION_LEVEL3.md` §3~11 구조 그대로)

```
1. §5 Grammar Gate 검증
   ├─ 5.1 최소 자격 기준 검증(Engine 단위 검증 완료, Tier D 실데이터로 재확인 가능한 상태)
   └─ 5.2 4단계 사다리 강제 진입 테스트

2. §6 White List 검증
   ├─ 6.1 Rule 기반 1차 검증(전 단계 공통) — 이미 Engine 단위 검증됨, Tier D 실데이터로 재확인 가능한 상태
   └─ 6.2 LLM 기반 2차 검증(사다리 1단계 전용) — Blocker 6 해결 후에만 실 시나리오 가능

3. §7 Related/Contrast/Alternative 검증
   └─ 52개 관계 전수 find_related_nodes 정확 반환, 순환 0건(4개 언어 전부 validateLanguagePack로 이미 확인 완료)

4. §8 Review Engine 검증
   └─ Cascade 깊이 위반 0건, get_due_reviews 우선순위 일치 — 워커·AC-011 모두 해소되어
      실행 가능 — Tier D 콘텐츠 적재 완료로 즉시 실행 가능

5. §9 Conversation 검증(범위 제한)
   └─ 3개 경계 항목만(내부 동작은 판정 대상 아님, Conversation Engine 자체 미설계)

6. §10 AI Generation 검증
   └─ 표층 변주 중복 0건, 실패 처리 분기 정확 — Mock 기반으로 상당 부분 가능, "실제 생성
      시나리오" 조건만 Blocker 6에 종속

7. §3 End-to-End 학습 시나리오(E2E-1~6)
   └─ 4개 언어 각각 최소 1회 — CLIENT_BRIEF.md §2 호출 순서를 API 통합 테스트로 재현.
      1~6 항목이 전부 준비된 후 최종 통합 실행

8. §4 Golden Test Set 실행
   └─ 85 Node·52 관계(실현분)·16 시나리오·18 동형이의 커버리지 확인 — 데이터는 이미 적재 완료

9. §12 Pass/Fail 판정
   └─ 절별 PASS 조건 대조, 부분 실현 2건(JA 시나리오2, EN 시나리오4)은 이미 정의된 대로
      FAIL 재판정하지 않음
```

**순서 원칙**: §5~10(개별 메커니즘 검증)을 먼저 통과시킨 뒤 §3(통합 E2E)·§4(전수 커버리지)로 진행한다.

---

## 9. Beta Release Gate 진입 조건 (`VALIDATION_LEVEL3.md` §13 그대로)

**충족해야 할 조건(전부)**:
1. §12의 모든 절이 PASS.
2. Pending 2건(JA RARERU Content Gap, EN NOT_YET Structural Gap)은 이미 Non-blocking으로 분류 — Gate를 막지 않되 Beta 공지에 명시.
3. Conversation 기능은 Beta 범위에서 "제공되지 않음"으로 명시(§9) — 실패가 아니라 기능 범위 결정.
4. §11 임시 로그로 §3~10 전체 실행 기록이 재현 가능한 형태로 남아 있을 것.

**Gate를 막는 조건(하나라도 발생 시 Beta 보류)**:
- Grammar Gate 최소 자격 기준 위반 실제 발생(§5.1 부정 케이스 실패)
- White List Rule 기반 검증이 허용되지 않은 문법을 실제로 통과시킴(§6.1 양성 탐지 실패)
- 4개 언어 중 하나라도 E2E 시나리오 미완주(§3)
- Review Cascade가 `max_depth=2` 위반해 무제한 확산(§8)

**주의**: `VALIDATION_LEVEL3.md` §13 자체가 명시하듯, 이 문서(그리고 이 계획서)는 최종 승인을 대신하지 않는다 — 판정 기준만 제공하며, 실제 Beta Release 결정은 별도 사용자 승인 사항이다.

---

## 요약

| 구분 | 항목 수 | 비고 |
|---|---|---|
| Validation Level 3 Blocker | **0건** | 최초 6건 → 0건 |
| Architecture 결정 대기 | 1건 | 실 LLM 호출 여부 — 유일하게 남은 항목(§6.2·§10의 "실제 생성 시나리오" 조건에만 영향, 나머지는 Mock으로 진행 가능) |
| Non-blocking(병행 가능) | 4건 | AC-006/007/010, auth/convert |
| 이번 라운드에 해소됨 | 6건 | CLIENT_BRIEF.md, CONTENT_PRODUCTION_STANDARD.md, AC-004, cascade_jobs 워커, **Tier D 콘텐츠 적재**(21 Concept·85 Node·52 Relation·255 Content·12 Vocabulary), (AC-011은 직전 라운드) |
| Client 구현 필요 여부 | **불필요** | E2E 시나리오는 API 레벨 통합 테스트로 재현 |

## 결론

**Validation Level 3 진입 Blocker는 전부 해소됐다.** `VALIDATION_LEVEL3.md` §2.1이 요구한 6개 조건(Tier D 콘텐츠, 외부 API 5개, Engine 8개, `CLIENT_BRIEF.md` 흐름, Relation 52개, `CONTENT_PRODUCTION_STANDARD.md`)을 전부 충족했고, 4개 언어팩 전체가 `graphEngine.validateLanguagePack` 검증을 통과했다. §8 실행 순서(본 문서 §8)를 그대로 따라 §5~10 개별 메커니즘 검증부터 시작할 수 있는 상태다. 유일하게 남은 항목(실 LLM 호출 여부)은 §6.2·§10의 일부 조건에만 영향을 주며, 나머지는 지금 즉시 진행 가능하다.

코드 작업(마이그레이션 1건, 파서 2개 모듈, 시드 스크립트, 스키마 테스트)을 완료하고 175/175 회귀 테스트로 확인했습니다. 다음 지시를 기다리겠습니다.
