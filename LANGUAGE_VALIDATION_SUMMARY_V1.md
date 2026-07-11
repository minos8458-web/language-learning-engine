# LANGUAGE_VALIDATION_SUMMARY_V1.md
## VI/EN/JA/ZH 종합 검증 — LLE Core Standard 안정성 판정

> 이 문서는 새 기능을 만들지 않는다. 지금까지 만든 Core Standard가 **고립어(VI)·분석어(EN)·교착어(JA)·고립어+성조+한자(ZH)** 네 가지 유형론적으로 다른 언어에서 실제로 수정 없이 버텼는지를 종합하고, 다섯 번째 언어로 넘어가기 전 Core Standard를 얼마나 신뢰해도 되는지 판정한다.

---

## 1. VI/EN/JA/ZH Language Pack 비교

| 항목 | VI(고립어) | EN(분석어) | JA(교착어) | ZH(고립어+성조+한자) |
|---|---|---|---|---|
| Grammar Node 수 | 24 | 21 | 19 | 21 |
| 사용한 Concept 수 | 20 | 19 | 18 | 19 |
| 신규 Concept(이 언어가 처음 필요로 함) | 2(PRAGMATICS Category + WHQUESTION) | 1(PARTITIVE) | **0** | **0** |
| Relation 수 | 16 | 14 | 11 | 11 |
| ALTERNATIVE 관계 | 1건(`CO_THE`↔`DUOC_ABILITY`) | 0건 | 0건(v1.1 이월) | 0건(会 이중 기능, v1.1 이월) |
| Wh-의문문 전략 | 제자리형(`WH_INSITU`) | 전치형(`WH_FRONTING`) | 제자리형(`WH_INSITU`, VI와 동일) | 제자리형(`WH_INSITU`, 4번째 확인) |
| 검증에서 자체 발견한 오류 | ID 언더스코어 누락 3건, 뷰 불일치 1건 | 뷰 불일치 1건, 관계 유형 오류 1건(실제 문장 재검증으로 발견) | 없음(검증 전 설계 단계에서 선제적으로 해소) | **없음(첫 작성부터 0건)** |

**가장 중요한 관찰**: 신규 Concept 필요 건수가 **2 → 1 → 0 → 0**으로 언어가 추가될수록 줄어들었다. 이는 우연이 아니라 Concept 레이어가 실제로 언어 독립적 추상화에 수렴하고 있다는 정량적 증거다. 검증 오류 발생 건수도 **VI(4건)→EN(2건)→JA(0건)→ZH(0건)**로 함께 줄어, 표준화(LANGUAGE_PACK_STANDARD)의 재발 방지 효과가 실제로 누적되고 있음을 보여준다.

---

## 2. Validation Matrix

VI/EN/JA/ZH를 동일 기준으로 비교하는 표다. 언어가 추가될수록 이 표에 열만 추가하면 된다.

| 검증 항목 | VI | EN | JA | ZH |
|---|---|---|---|---|
| 언어 유형 | 고립어 | 분석어(잔존 굴절) | 교착어 | 고립어 + 성조 + 한자 |
| Level 0 Schema Validation | PASS(v1.2 이후) | PASS | PASS | **PASS(처음부터, 재발 오류 0건)** |
| Level 2 Language Pack Validation | PASS | PASS | PASS | **PASS(Learning Outcome Scenario 4/4 처음부터 통과)** |
| 신규 Category 필요 | 1건(PRAGMATICS, Tier C) | 0건 | 0건 | **0건** |
| 신규 Concept(Function) 필요 | 1건(WHQUESTION, Tier B) | 1건(PARTITIVE, Tier B) | 0건 | **0건** |
| Identifier Standard 영향 | 있음(용어 오류 수정 유발) | 있음(Aux+Pattern 신설) | 있음(형태소 순서 일반화) | **있음(Pinyin 다음자 해소 절차 구체화, v1.9)** |
| Vocabulary Schema 의존 | Wh-단어 | 불규칙 활용, Partitive, Wh-단어 | 활용류(`features`) | **다음자 해소(`VOCAB_ZH_LE`/`VOCAB_ZH_LIAO`), Wh-단어** |
| Content Tier D 분리 | 완료 | 완료 | 완료(콘텐츠 없음) | **완료(콘텐츠 없음)** |
| Wh-의문문 전략 | 제자리형 | 전치형 | 제자리형 | **제자리형(4번째 확인, EN이 유일한 소수 유형으로 굳어짐)** |
| 고유 위험 요소(해결 전) | 성조 제거 SLUG | 진성 조동사 예외 | 활용류 예측 불가능성 | **병음 정규화 — 1개 사례(了) 검증 완료, 추가 검증 필요(10장)** |

---

## 2.1 Concept 실현 여부 매트릭스 (Implemented / Not Applicable)

세 번째 언어(JA)부터 "이 Concept이 이 언어에서 아예 실현되지 않는" 사례가 반복적으로 나타났다. 이를 "언어팩이 불완전하다"는 신호와 구분하기 위해 상태를 명시적으로 표기한다.

- **Implemented(구현됨)**: 이 Concept을 실현하는 Grammar Node가 있다.
- **Not Applicable(해당 없음)**: 이 언어의 문법 구조상 이 Concept이 애초에 문법화되지 않는다 — 결함이 아니라 언어학적 사실이다.

| Concept | VI | EN | JA | ZH |
|---|---|---|---|---|
| TENSE_PAST | Implemented(đã) | Implemented(-ed) | Implemented(た) | **Not Applicable**(ASPECT_PERFECT가 대체) |
| TENSE_FUTURE | Implemented(sẽ) | Implemented(will) | **Not Applicable**(비과거형 겸용) | Implemented(会) |
| ASPECT_PROGRESSIVE | Implemented | Implemented | Implemented | Implemented |
| ASPECT_PERFECT | Implemented | Implemented | Not Applicable(과거형이 포괄) | Implemented(사실상 TENSE_PAST까지 겸함) |
| QUANTITY_CLASSIFIER | Implemented | **Not Applicable**(PARTITIVE로 대체) | Implemented | Implemented |
| QUANTITY_PARTITIVE(EN 신설) | Not Applicable | Implemented | Not Applicable | Not Applicable |
| (나머지 14개 Concept) | Implemented | Implemented | Implemented | Implemented |

**관찰**: Not Applicable은 이미 4개 언어에서 5회 발생했다(VI 0회, EN 1회, JA 2회, ZH 2회) — 언어가 늘수록 이 표기 자체의 필요성이 커지고 있다. 향후 EN/JA/ZH_LANGUAGE_PACK.md의 §2·§3에도 이 상태 표기를 소급 적용하는 것을 권고한다(현재는 "설계 노트" 산문으로만 기록되어 있어 한눈에 비교하기 어렵다).

---

## 3. Core Standard 수정 없이 해결된 항목

- **Grammar Node/Relation/Content/Progress의 필드 구조 자체**는 세 언어 어디에서도 스키마 필드를 추가하지 않고 그대로 사용됐다.
- **"같은 표면 형태, 다른 기능 → 다른 노드" 원칙**(GRAMMAR_SCHEMA §1)은 VI(`được`)와 EN(`could`)에서 각각 독립적으로 실증됐고, **ZH(`吧` — `BA_SUGGEST`/`BA_CONFIRM`)에서 한 언어 안에 이 패턴이 나타난 첫 사례로 재확인됐다**(VALIDATION_REPORT_ZH_v1.0 §4.1이 이 사례를 프로젝트 전체의 대표 Validation Example로 지정). 세 사례 모두 관계 없는 두 노드 사이에 억지로 Relation을 만들지 않았다는 공통점이 있다.
- **"하나의 Concept, 여러 Grammar Node" 구조**(CONCEPT_SCHEMA §10에서 예정)는 VI(`CO_THE`/`DUOC_ABILITY`, `DUOC_PASSIVE`/`BI`)에서 예정대로 실증됐고, JA(`MASU`를 PRAGMATICS 대표 노드로 지정)에서 **역방향 활용**(여러 노드를 하나로 대표시키는 패턴)으로 재사용됐다 — 스키마 변경 없이 새로운 활용 패턴을 흡수했다.
- **Concept Difficulty ≠ Grammar Node Difficulty 분리**(CONCEPT_SCHEMA §5)는 VI(분류사, 개념보다 구현이 어려움)와 JA(분류사+음편, 같은 방향으로 더 심화)에서 반복 실증됐다.
- **Vocabulary/Grammar 책임 경계**("규칙은 Grammar, 예외는 Vocabulary")는 EN(불규칙 동사)에서 만들어졌고, JA(활용류라는 훨씬 복잡한 문제)에서도 **새 계층 추가 없이** 그대로 버텼다 — `features` Reserved 필드 하나로 흡수됐다.

---

## 4. 새 Concept가 필요했던 항목 (Tier B/C 이력)

| Concept/Category | 언어 | Tier | 근거 |
|---|---|---|---|
| PRAGMATICS(Category 신설) | VI | **Tier C**(최고 승인) | 종결사·존대 표지는 명제 내용이 아니라 발화 태도를 표시하는 질적으로 다른 축이라 기존 9개 Category 어디에도 속하지 않음 |
| CONCEPT_MOOD_WHQUESTION | VI | Tier B | Wh-의문문은 MOOD가 이미 다루는 "문장 유형"의 하위 유형이라 새 Category 없이 기존 MOOD 안에 편입 |
| CONCEPT_QUANTITY_PARTITIVE | EN | Tier B | 베트남어 분류사(의무적 일반 체계)와 영어 partitive(불가산명사 전용 선택적 계량)는 메커니즘이 달라 같은 Function으로 억지로 묶지 않음 |
| (해당 없음) | JA | — | 19개 노드 전부 기존 20개 Concept로 매핑, 신규 제안 0건 |
| (해당 없음) | ZH | — | 21개 노드 전부 기존 19개 Concept로 매핑, 신규 제안 0건 — **2개 언어 연속 0건** |

**패턴**: Tier C(새 Category)는 정말로 다른 축일 때만(PRAGMATICS), Tier B(기존 Category 내 새 Function)는 같은 축의 세부 변형일 때(WHQUESTION, PARTITIVE) 발생했다. 이 구분이 실제로 잘 작동했다는 뜻이다. **JA·ZH 연속 0건은 Concept 목록이 실질적으로 수렴 단계에 들어섰다는 강한 신호다(10장 재확인).**

---

## 5. Identifier Standard에 영향을 준 항목

| 버전 | 계기(어느 언어) | 내용 |
|---|---|---|
| v1.1 | (CONTENT_SCHEMA 신설, 언어 무관) | Content ID의 media/source 마커 제거, content_type 10종 기준 재정의 |
| v1.2 | (PROGRESS_SCHEMA 신설, 언어 무관) | Progress/Attempt Record ID 참조 출처 갱신 |
| v1.3~1.4 | **EN** | Auxiliary+Pattern SLUG 규칙 신설(형태 범주 축약어), 진성 조동사 예외 규칙 |
| v1.5 | (VOCABULARY_SCHEMA 신설, 언어 무관) | Vocabulary ID 규칙 신설 |
| v1.6 | **EN→VI 소급 적용** | Structure-only SLUG 규칙(`WH_INSITU`/`WH_FRONTING`/`DO_SUPPORT_Q` 3회 반복 후 공식화) |
| v1.7~1.8 | **JA** | Auxiliary+Pattern의 "조동사가 항상 먼저"라는 가정이 일본어(`TE_IRU`, 패턴이 먼저)에서 깨져, "표면 형태소 결합 순서를 그대로 따르는 단일 원칙"으로 재일반화 |
| v1.9 | **ZH** | 중국어 병음 SLUG 규칙 구체화 — 다음자(多音字) 해소 3단계 절차(문법 기능 결정→VOCABULARY_SCHEMA에서 발음 확정→Identifier 생성) 정의. IDENTIFIER_STANDARD와 VOCABULARY_SCHEMA의 최초 명시적 연결 지점 |

**흥미로운 공통점**: GRAMMAR_GRAPH.md의 "정방향/역방향 탐색" 용어 오류와 v1.7의 "조동사가 항상 먼저" 가정 오류는 둘 다 **암묵적으로 영어(또는 특정 언어) 중심으로 설계하고 나중에야 발견된 사례**다. v1.9(ZH)는 이 패턴과는 다른 종류다 — 오류 수정이 아니라, VI·JA에는 없던 "문자와 발음의 다대다 관계"라는 새로운 문제 유형에 대한 최초 대응이다.

---

## 6. Vocabulary Schema로 해결된 항목

| 언어 | 해결된 문제 | 방식 |
|---|---|---|
| VI | Wh-단어(gì/đâu/khi nào) | 열린 어휘 집합, Grammar Node는 구조만 |
| EN | 불규칙 동사 활용(go→went), Partitive 계량어(piece/cup/glass), Wh-단어(what) | Irregular Surface Form + 열린 어휘 집합 |
| JA | 활용류(godan/ichidan) 정보 | 새 Stem 계층 없이 `features` Reserved 필드(`verb_class`)로 흡수, `帰る` 실사례로 증명 |
| ZH | **다음자(多音字) 해소**(了 le/liǎo), Wh-단어(什么) | 발음이 확정된 형태를 Lemma 단위로 분리(`VOCAB_ZH_LE`/`VOCAB_ZH_LIAO`), `features.polyphonic_group`으로 같은 문자 공유 관계만 참고 표기 |

**검증**: VOCABULARY_SCHEMA.md는 애초에 "규칙형은 저장 안 함" 원칙 하나로 설계됐는데, 네 언어의 서로 다른 문제(어휘 선택/불규칙 활용/활용류 예측 불가능성/다음자 해소)가 전부 그 원칙 하나로 흡수됐다 — 스키마 변경 없이. **ZH는 추가로 "Irregular Surface Form이 아예 필요 없는 언어"이기도 하다**(중국어는 형태론적 굴절이 없음) — Vocabulary Schema가 "어떤 언어는 이 필드를 아예 쓰지 않아도 된다"는 유연성까지 자연스럽게 수용했다는 뜻이다.

---

## 7. Content 분리로 해결된 항목

- VI·EN 둘 다 초기에는 완성된 Content 실 데이터가 Language Pack 문서 안에 흩어져 있었다(각 검증 보고서의 PENDING-2 항목).
- CONTENT_SCHEMA의 3축 분리(content_type/media_assets/source)로 애초에 뒤섞여 있던 매체·생성주체 정보가 정리됐다.
- `grammar_node_id`(단수)→`grammar_node_ids`(배열) 변경으로 DIALOGUE 등 다중 노드 콘텐츠를 위한 여지가 생겼다.
- **LANGUAGE_PACK_STANDARD.md의 Tier D 분리 표준화** 이후 VI_CONTENT.md·EN_CONTENT.md·JA_CONTENT.md 세 문서 모두 "Required Content ID(Tier B)"와 "실제 본문(Tier D)"이 명확히 나뉘어졌다. JA는 애초부터 이 구조로 시작해 흩어짐 자체가 발생하지 않았다.

---

## 8. 아직 남아 있는 Pending 항목

| # | 항목 | 발생 언어 | 상태 |
|---|---|---|---|
| 1 | `(TBD)` Content의 API 계약상 상태(empty_result 처리 권장, 미확정) | VI/EN 공통 | 낮은 우선순위, API_CONTRACT.md 개정 시 처리 |
| 2 | "복수형(Number/Plural)" Concept 공백 (mouse→mice 검토 중 발견) | EN(VOCABULARY_SCHEMA 작성 중) | 아직 어느 언어팩도 다루지 않음, 필요성 확인 안 됨 |
| 3 | `must`(ALTERNATIVE 사례), `be going to`/`used to`/`have been V-ing` | EN v1.1 이월 | Language Pack 수준 확장, Core Standard 영향 없음 |
| 4 | vừa mới/đã từng(과거 뉘앙스 확장) | VI v2.0 후보 | 미결정 |
| 5 | 가능형 활용(食べられる, ALTERNATIVE 후보), と/ば/なら, する/来る 불규칙, 완료상 세분화 | JA v1.1 이월 | Language Pack 수준 확장 |
| 6 | Modal 도치(`SUBJECT_AUX_INVERSION`)에 상응하는 VI/JA의 유사 메커니즘 필요 여부 | ZH 검토 결과: 불필요로 판단 | ZH는 吗/WH_INSITU만으로 의문문이 전부 구성되어 별도 도치 메커니즘이 필요 없었다 — EN의 `SUBJECT_AUX_INVERSION`은 영어 특유의 요구였을 가능성이 높아짐(완전 해소는 아니나 위험도 하향) |
| 7 | 会의 능력 표현 이중 기능(ALTERNATIVE 후보) | ZH v1.1 이월 | Language Pack 수준 확장 |
| 8 | 把구문·방향보어·양사 어휘 확장 | ZH v1.1 이월 | Language Pack 수준 확장 |
| 9 | Pinyin Normalization 규칙의 추가 검증(다음자 사례가 1건뿐) | ZH(신규) | Experimental 유지, 최소 2~3개 추가 다음자 사례로 검증 필요(10장) |

**중요한 구분**: 1·2·9번은 Core Standard(Tier A) 영향이 있을 수 있는 항목이고, 3·4·5·7·8번은 순수 Language Pack(Tier B) 수준 확장이라 Freeze 판정과 무관하다.

---

## 9. ZH_LANGUAGE_PACK 진행 전 위험 요소

| 위험 | 근거 | 위험도 |
|---|---|---|
| **"了"의 다의성** | 완료상(ASPECT_PERFECT)과 상태 변화("이제 ~하다")를 하나의 형태가 겸함 — VI `được`처럼 같은 형태·다른 기능 사례가 될 가능성이 높지만, 이번엔 TENSE/ASPECT 축의 다의성이라 새로운 유형일 수 있다 | 중간 |
| **분류사(量詞) 체계의 규모** | 중국어 양사는 VI(2개)보다 훨씬 정교하게 발달해 있어, "언제 Grammar Node를 늘리고 언제 Vocabulary로 미룰지"의 경계가 VI 때보다 더 자주 시험대에 오를 것 | 중간 |
| **병음 기반 SLUG 정규화** | IDENTIFIER_STANDARD §3의 성조 제거 규칙이 지금까지 실전에서 검증된 적이 없다(VI는 로마자 기반이라 그대로 적용, JA는 로마자 변환이 아니라 형태소 축약어 방식을 썼다) — 병음 성조 표기 처리 방식이 이번에 처음 실전 테스트된다 | 높음 |
| **어기조사(吧/呢/啊)** | PRAGMATICS Category 신설 당시 이미 중국어 사례로 예견되어 있었다(CONCEPT_SCHEMA §3 Tier C 근거) — 오히려 준비되어 있어 위험 낮음 | 낮음 |
| **암묵적 언어 편향 재발 가능성** | 4장에서 확인했듯 "정방향/역방향", "조동사가 항상 먼저" 두 사례 모두 특정 언어 중심 가정이 뒤늦게 발견됐다. ZH 작업 중에도 비슷한 미발견 편향이 있을 가능성을 열어두고 접근해야 한다 | 중간(구조적 위험) |

---

## 10. 결론 — Core Standard Freeze 판정

**이분법(Freeze/Open)보다 3단계 분류가 더 정확하다.** "완전히 확정"과 "완전히 열림" 사이에 "구조는 있지만 아직 충분히 검증되지 않은 규칙"이 실제로 존재하기 때문이다. 3단계로 재분류한다.

| 단계 | 정의 | 승격 조건 |
|---|---|---|
| **Frozen** | 유형론적으로 다른 언어 3개 이상에서 구조 변경 없이 검증 완료 | (도달 후에는 PROJECT_VISION §6 최고 수준 승인 없이는 변경 불가) |
| **Frozen(언어 특정)** | 특정 언어 하나에만 적용되는 규칙이 그 언어 안에서 충분히 다양한 사례(충돌·비충돌 포함)로 검증되어, 새 메커니즘 없이 기존 규칙만으로 전부 해소됨 | 같은 언어 내 최소 8~10건 이상의 다양한 사례, 그중 충돌형 포함 |
| **Controlled Open** | 구조는 안정적이나 Tier B/C 같은 통제된 절차를 통해서만 인스턴스가 늘어날 수 있음 | Frozen 승격 조건 충족 시 |
| **Experimental** | 규칙은 정의되어 있으나 검증 사례가 부족해 아직 신뢰 수준이 낮음 | **언어 독립적 규칙**은 구조 변경 없이 2개 언어 이상 성공 시 Controlled Open, 3개 이상 유형이 다르면 Frozen. **언어 특정 규칙**은 그 언어 안에서 서로 다른 사례 2~3건을 통과해야 Controlled Open, 8건 이상(충돌형 포함)이면 Frozen(언어 특정) |

### 현재 분류(ZH + Pinyin Stress Test 반영 갱신)

| 구성 요소 | 단계 | 근거 |
|---|---|---|
| Grammar/Vocabulary/Content/Progress 4축 분리, 각 스키마의 필드 구조, 5-Tier 문서 체계, ID Stability Principle | **Frozen** | VI/EN/JA/ZH 네 유형에서 전부 무수정 통과(3장) |
| Concept 21개 인스턴스, Category 10개 | **Controlled Open(Frozen 근접)** | JA·ZH 2개 언어 연속 신규 Concept 0건. Frozen 조건(3개 이상)에는 아직 1개 부족 |
| Auxiliary+Pattern 형태소 순서 일반화 규칙 | **Controlled Open** | EN·JA 두 어순에서 검증, 세 번째 확증 사례 아직 없음 |
| Structure-only SLUG 규칙 | **Controlled Open** | 네 언어 전부 Wh-의문문류만 확인, 다른 종류의 구조 문법 미검증 |
| Vocabulary `features` 예약 필드 | **Controlled Open** | JA(`verb_class`)·ZH(`polyphonic_group`) 2개 언어에서 쓰임, 실제 Content 운영 검증은 아직 |
| **Pinyin(병음) SLUG 정규화 규칙** | **Frozen(언어 특정)으로 승격** | PINYIN_NORMALIZATION_STRESS_TEST.md — 11개 사례(충돌형 3건 포함) 전부 기존 규칙(품사 DISAMBIGUATOR, 엔터티 접두사)만으로 해소, 새 메커니즘 0건. 동품사·동성조 충돌만 이론적 잔여 위험으로 남음 |

**변경 사항**: Pinyin 규칙이 이번 갱신으로 **Experimental → Frozen(언어 특정)**으로 두 단계 승격됐다 — 예상보다 빠른 승격인데, 근거(11건, 충돌형 포함, 새 메커니즘 불필요)가 충분히 강력하다고 판단했다.

**실질적 권고**: 다섯 번째 언어 착수 여부와 무관하게, Concept 목록은 다음 언어에서 신규 0건이 한 번 더 확인되면 Frozen 격상을 공식 검토한다. Auxiliary+Pattern·Structure-only SLUG는 아직 사례 다양성이 부족하므로 다음 언어(교착어가 아닌 다른 유형이면 더 좋음)에서 계속 관찰한다.

---

## 11. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 작성 — VI/EN/JA 3개 언어팩 비교, Core Standard 무수정 해결 항목, Tier B/C 발생 이력(2→1→0 수렴 확인), IDENTIFIER_STANDARD 영향 이력(암묵적 언어 편향 패턴 2건 확인), Vocabulary/Content 분리 효과 검증, Pending 6건 정리, ZH 위험 요소 5건 평가(병음 SLUG 정규화가 최고 위험), 결론: 스키마 구조는 Freeze, Concept 목록은 Tier B/C로만 확장 가능한 Open 상태 유지 |
| 1.1 | 2026-07-06 | Validation Matrix 신설(2장, VI/EN/JA/ZH 동일 기준 비교, 언어 추가 시 열만 추가하는 구조). 결론(현 10장)을 Frozen/Controlled Open/Experimental 3단계로 재구성 — Concept 목록·Auxiliary+Pattern 규칙·Structure-only SLUG는 Controlled Open, Vocabulary `features` 활용과 Pinyin 정규화는 Experimental로 분류, 승격 조건 명시 |
| 1.2 | 2026-07-06 | ZH_LANGUAGE_PACK v1.0 실제 검증 결과 반영 — 신규 Concept 2연속 0건(JA+ZH), 검증 오류 2연속 0건. Concept 실현 여부 매트릭스(§2.1) 신설(Implemented/Not Applicable, TENSE_PAST가 ZH에서 처음 미실현). 승격 조건을 언어 독립적 규칙(다개 언어 기준)과 언어 특정 규칙(동일 언어 내 다양성 기준)으로 세분화, Vocabulary `features`는 Controlled Open 승격, Pinyin은 Experimental 유지(다음자 사례 1건, 2~3건 필요). ZH `吧`(BA_SUGGEST/BA_CONFIRM) 사례를 "같은 형태, 다른 기능" 원칙의 대표 Validation Example로 교차 기록 |
| 1.3 | 2026-07-06 | PINYIN_NORMALIZATION_STRESS_TEST.md 결과 반영 — 다음자 10종 추가 검증(총 11건, 충돌형 3건 포함) 후 Pinyin 규칙을 Experimental→**Frozen(언어 특정)**으로 승격. 3단계 체계에 "Frozen(언어 특정)" 하위 등급 신설. Vocabulary `features`도 Controlled Open으로 갱신 |
