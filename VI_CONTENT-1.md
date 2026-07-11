# VI_CONTENT.md
## 베트남어 Content 본문 (Tier D)

> 이 문서는 `VI_LANGUAGE_PACK.md` §8(Required Content 목록)이 요구하는 Content ID의 **실제 본문**을 담는다. 구조는 CONTENT_SCHEMA.md(Tier A)를 따르며, 이 문서는 그 구조에 맞춘 데이터만 제공한다.

문서 계층: `CONTENT_SCHEMA.md`(Tier A) → `VI_LANGUAGE_PACK.md`(Tier B, 어떤 Content가 필요한지) → **`VI_CONTENT.md`(Tier D, 실제 본문)**

---

## 0. 문서의 지위

- Tier D. CONTENT_SCHEMA.md의 필드 구조를 그대로 따르며 새 필드를 추가하지 않는다.
- VI_LANGUAGE_PACK.md §8에 나열된 Content ID와 이 문서의 항목은 반드시 1:1 대응해야 한다.

---

## 1. 완성된 Content

| ID | grammar_node_ids | content_type |
|---|---|---|
| CONTENT_VI_DA_EXPL_KO_BEGINNER | [GRAMMAR_VI_DA] | EXPLANATION |
| CONTENT_VI_DA_EXAMPLE_1 | [GRAMMAR_VI_DA] | EXAMPLE |
| CONTENT_VI_DANG_EXPL_KO_BEGINNER | [GRAMMAR_VI_DANG] | EXPLANATION |
| CONTENT_VI_DANG_EXAMPLE_1 | [GRAMMAR_VI_DANG] | EXAMPLE |

```json
[
  {
    "id": "CONTENT_VI_DA_EXPL_KO_BEGINNER",
    "grammar_node_ids": ["GRAMMAR_VI_DA"],
    "content_type": "EXPLANATION",
    "explanation_level": "BEGINNER",
    "media_assets": [
      { "media_format": "TEXT", "asset_ref": "'đã'는 동사 앞에 붙어 이미 끝난 일을 나타낼 때 씁니다.", "role": "PRIMARY" }
    ],
    "source": "HUMAN_AUTHORED",
    "human_reviewed": true,
    "is_canonical": true,
    "difficulty": 1,
    "meta_language": "KO",
    "version": 1,
    "author": "architecture_seed"
  },
  {
    "id": "CONTENT_VI_DA_EXAMPLE_1",
    "grammar_node_ids": ["GRAMMAR_VI_DA"],
    "content_type": "EXAMPLE",
    "media_assets": [
      { "media_format": "TEXT", "asset_ref": "Tôi đã ăn cơm. (나는 밥을 먹었다.)", "role": "PRIMARY" }
    ],
    "source": "HUMAN_AUTHORED",
    "human_reviewed": true,
    "is_canonical": true,
    "difficulty": 1,
    "meta_language": "KO",
    "version": 1,
    "author": "architecture_seed"
  },
  {
    "id": "CONTENT_VI_DANG_EXPL_KO_BEGINNER",
    "grammar_node_ids": ["GRAMMAR_VI_DANG"],
    "content_type": "EXPLANATION",
    "explanation_level": "BEGINNER",
    "media_assets": [
      { "media_format": "TEXT", "asset_ref": "'đang'은 동사 앞에 붙어 지금 진행 중인 일을 나타냅니다.", "role": "PRIMARY" }
    ],
    "source": "HUMAN_AUTHORED",
    "human_reviewed": true,
    "is_canonical": true,
    "difficulty": 1,
    "meta_language": "KO",
    "version": 1,
    "author": "architecture_seed"
  },
  {
    "id": "CONTENT_VI_DANG_EXAMPLE_1",
    "grammar_node_ids": ["GRAMMAR_VI_DANG"],
    "content_type": "EXAMPLE",
    "media_assets": [
      { "media_format": "TEXT", "asset_ref": "Tôi đang ăn cơm. (나는 밥을 먹고 있다.)", "role": "PRIMARY" }
    ],
    "source": "HUMAN_AUTHORED",
    "human_reviewed": true,
    "is_canonical": true,
    "difficulty": 1,
    "meta_language": "KO",
    "version": 1,
    "author": "architecture_seed"
  }
]
```

---

## 2. 미완성 Content

VI_LANGUAGE_PACK.md §8에 나열된 나머지 노드는 Content ID만 확정되어 있으며 본문은 아직 없다(`(TBD)`). 콘텐츠 제작 단계에서 이 문서에 위와 동일한 JSON 구조로 추가한다.

---

## 3. 개정 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-07-06 | 최초 작성 — VI_LANGUAGE_PACK.md/IMPLEMENTATION_BRIEF.md에 흩어져 있던 완성 Content(DA/DANG 설명·예문)를 Tier D로 이관 |
