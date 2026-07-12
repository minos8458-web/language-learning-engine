// src/engines/graphEngine.js
//
// 책임(ENGINE_INTERFACE.md §4): Grammar Graph 구조 조회·순회 — 선행/후행 탐색,
// 순환 검증, Concept-Node 정합성 검증. 리프 Engine — 다른 어떤 Engine도 호출하지 않고,
// 어떤 상위 Engine도 이 Engine을 통해 호출되지 않는다(2.2 호출 방향 규칙).
//
// 하지 않는 일: 사용자 Progress를 조회·저장하지 않는다. "복습해야 한다"는 정책적
// 판단을 내리지 않는다 — 순수 구조 조회만 한다(§4-2).
//
// 구현하는 API(API_CONTRACT.md §3): find_prerequisites(3.1), find_related_nodes(3.2),
// validate_language_pack(3.3).

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'INVALID_ID';
  }
}

class ContractViolationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContractViolationError';
    this.code = 'CONTRACT_VIOLATION';
  }
}

async function nodeExists(pool, nodeId) {
  const { rows } = await pool.query('SELECT 1 FROM grammar_nodes WHERE node_id = $1', [nodeId]);
  return rows.length > 0;
}

/**
 * DOMAIN_LOGIC_BRIEF.md §2.1의 BFS 의사코드를 그대로 구현.
 * direction='prerequisite'면 from_node_id=n을 따라 to_node_id를 수집(선행 탐색, §2.1).
 * direction='dependent'면 반대 방향(§2.2 후행 탐색).
 * maxDepth가 null이면 무제한(순환 검증용, §2.3).
 *
 * @returns Map<node_id, depth>
 */
async function prerequisiteSearchInternal(pool, startNodeId, maxDepth, direction = 'prerequisite') {
  const visited = new Map();
  let frontier = [startNodeId];
  const column = direction === 'prerequisite' ? 'from_node_id' : 'to_node_id';
  const targetColumn = direction === 'prerequisite' ? 'to_node_id' : 'from_node_id';

  let depth = 0;
  while (frontier.length > 0 && (maxDepth == null || depth < maxDepth)) {
    depth += 1;
    const { rows } = await pool.query(
      `SELECT ${targetColumn} AS target FROM grammar_relations
       WHERE ${column} = ANY($1::text[]) AND relation_type = 'PREREQUISITE'`,
      [frontier]
    );
    const nextFrontier = [];
    for (const row of rows) {
      if (!visited.has(row.target)) {
        visited.set(row.target, depth);
        nextFrontier.push(row.target);
      }
    }
    frontier = nextFrontier;
  }

  return visited;
}

/**
 * 3.1 find_prerequisites — 선행 탐색.
 * @returns {Promise<string[]>} 가까운 순서로 정렬된 선행 노드 ID 목록
 */
async function findPrerequisites(pool, nodeId, maxDepth) {
  if (!(await nodeExists(pool, nodeId))) {
    throw new NotFoundError(`존재하지 않는 Grammar Node ID: ${nodeId}`);
  }
  if (!Number.isInteger(maxDepth) || maxDepth < 1) {
    throw new ContractViolationError('max_depth는 1 이상의 정수여야 합니다');
  }

  const visited = await prerequisiteSearchInternal(pool, nodeId, maxDepth, 'prerequisite');
  return [...visited.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id);
}

/**
 * 2.2 후행 탐색(Dependent Search) — Graph Engine 내부적으로는 find_prerequisites와
 * 대칭이지만, API_CONTRACT.md §3에는 별도 외부 API로 노출되어 있지 않다
 * (DOMAIN_LOGIC_BRIEF §2.2: "Production에서는 주로 커리큘럼 검증·Language Pack
 * 설계 시 쓰인다" — 런타임 API가 아니라 검증 파이프라인 내부 유틸리티).
 * validate_language_pack 등 내부 검증 로직에서 재사용하기 위해 함수로만 노출한다.
 */
async function dependentSearch(pool, nodeId, maxDepth) {
  if (!(await nodeExists(pool, nodeId))) {
    throw new NotFoundError(`존재하지 않는 Grammar Node ID: ${nodeId}`);
  }
  const visited = await prerequisiteSearchInternal(pool, nodeId, maxDepth, 'dependent');
  return [...visited.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id);
}

const VALID_RELATED_TYPES = ['RELATED', 'CONTRAST', 'ALTERNATIVE'];

/**
 * 3.2 find_related_nodes.
 * 해석: relation_type의 유효 도메인은 RELATED/CONTRAST/ALTERNATIVE 셋뿐이다
 * (PREREQUISITE는 3.1 전용 API로 별도 노출되어 있으므로 여기서는 유효하지 않은 값으로
 * 취급한다 — 문서가 "미지정 시 전체"라 할 때의 "전체"는 이 세 종류 전체를 의미한다고
 * 해석했다. 이 해석이 다르면 알려달라).
 *
 * 방향 처리(문서에 명시 없음, 해석적 판단): direction='UNIDIRECTIONAL'인 관계는
 * from_node_id 쪽에서만 검색되고, 'BIDIRECTIONAL'인 관계는 양쪽에서 검색된다.
 * PREREQUISITE의 "항상 UNIDIRECTIONAL" 제약과 동일한 원리를 다른 관계 타입에도
 * 일관되게 적용한 것 — 이 부분도 실제와 다르면 알려달라.
 */
async function findRelatedNodes(pool, nodeId, relationType) {
  if (!(await nodeExists(pool, nodeId))) {
    throw new NotFoundError(`존재하지 않는 Grammar Node ID: ${nodeId}`);
  }
  if (relationType !== undefined && !VALID_RELATED_TYPES.includes(relationType)) {
    throw new ContractViolationError(`정의되지 않은 relation_type: ${relationType}`);
  }
  const types = relationType ? [relationType] : VALID_RELATED_TYPES;

  const { rows } = await pool.query(
    `SELECT to_node_id AS related_node_id, relation_type, weight
       FROM grammar_relations
      WHERE from_node_id = $1 AND relation_type = ANY($2::relation_type_enum[])
     UNION
     SELECT from_node_id AS related_node_id, relation_type, weight
       FROM grammar_relations
      WHERE to_node_id = $1 AND relation_type = ANY($2::relation_type_enum[]) AND direction = 'BIDIRECTIONAL'`,
    [nodeId, types]
  );

  return rows.map((r) => ({
    related_node_id: r.related_node_id,
    relation_type: r.relation_type,
    weight: Number(r.weight),
  }));
}

/**
 * 3.3 validate_language_pack.
 * (a) cycle_violations: PREREQUISITE 부분 그래프에 순환이 있는지 전수 검사(GRAMMAR_GRAPH §3).
 *     DOMAIN_LOGIC_BRIEF §2.3은 "관계 추가 시점"의 점증적 검사를 정의하지만, 이 API는
 *     이미 적재된 Language Pack 전체를 배포 전 일괄 검증하는 용도(GRAMMAR_GRAPH §3)이므로
 *     모든 PREREQUISITE 엣지에 대해 DFS 기반 전수 순환 탐지를 수행한다.
 * (b) concept_consistency_violations: AC-003 복구 메모 — Concept A가 Concept B를
 *     prerequisite로 요구하는데, A/B에 대응하는 Grammar Node들 사이에 PREREQUISITE
 *     관계가 전혀 없으면 위반으로 기록한다.
 */
async function validateLanguagePack(pool, language) {
  const { rows: nodes } = await pool.query(
    'SELECT node_id, concept_ids FROM grammar_nodes WHERE language = $1',
    [language]
  );
  if (nodes.length === 0) {
    throw new NotFoundError(`언어 '${language}'에 대한 Grammar Node 데이터가 없습니다`);
  }

  const { rows: edges } = await pool.query(
    `SELECT from_node_id, to_node_id FROM grammar_relations gr
       JOIN grammar_nodes gn ON gn.node_id = gr.from_node_id
      WHERE gr.relation_type = 'PREREQUISITE' AND gn.language = $1`,
    [language]
  );

  const cycleViolations = detectCycles(edges);

  const concepts = await pool.query('SELECT concept_id, prerequisite_concept_ids FROM concepts');
  const nodesByConcept = new Map(); // concept_id -> Set(node_id)
  for (const n of nodes) {
    for (const c of n.concept_ids) {
      if (!nodesByConcept.has(c)) nodesByConcept.set(c, new Set());
      nodesByConcept.get(c).add(n.node_id);
    }
  }
  const edgeSet = new Set(edges.map((e) => `${e.from_node_id}->${e.to_node_id}`));

  const conceptConsistencyViolations = [];
  for (const concept of concepts.rows) {
    const dependentNodes = nodesByConcept.get(concept.concept_id);
    if (!dependentNodes) continue; // 이 언어에 해당 Concept을 구현하는 노드가 없으면 검사 대상 아님
    for (const prereqConceptId of concept.prerequisite_concept_ids) {
      const prereqNodes = nodesByConcept.get(prereqConceptId);
      if (!prereqNodes) continue;
      const hasEdge = [...dependentNodes].some((a) =>
        [...prereqNodes].some((b) => edgeSet.has(`${a}->${b}`))
      );
      if (!hasEdge) {
        conceptConsistencyViolations.push({
          concept_id: concept.concept_id,
          prerequisite_concept_id: prereqConceptId,
          reason: 'Concept 레벨 선행 관계가 Grammar Node 레벨 PREREQUISITE 관계에 반영되지 않음',
        });
      }
    }
  }

  return {
    is_valid: cycleViolations.length === 0 && conceptConsistencyViolations.length === 0,
    cycle_violations: cycleViolations,
    concept_consistency_violations: conceptConsistencyViolations,
  };
}

/** DFS 기반 순환 탐지(색칠 알고리즘: WHITE/GRAY/BLACK). 순환에 관여한 노드 목록들을 반환. */
function detectCycles(edges) {
  const adjacency = new Map();
  for (const e of edges) {
    if (!adjacency.has(e.from_node_id)) adjacency.set(e.from_node_id, []);
    adjacency.get(e.from_node_id).push(e.to_node_id);
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  const violations = [];

  function visit(node, path) {
    color.set(node, GRAY);
    for (const next of adjacency.get(node) || []) {
      const c = color.get(next) || WHITE;
      if (c === GRAY) {
        // 순환 발견 — path에서 next가 처음 등장한 지점부터 잘라 순환 경로로 보고
        const cycleStart = path.indexOf(next);
        violations.push({ cycle: [...path.slice(cycleStart), next] });
      } else if (c === WHITE) {
        visit(next, [...path, next]);
      }
    }
    color.set(node, BLACK);
  }

  for (const node of adjacency.keys()) {
    if ((color.get(node) || WHITE) === WHITE) {
      visit(node, [node]);
    }
  }

  return violations;
}

module.exports = {
  findPrerequisites,
  dependentSearch,
  findRelatedNodes,
  validateLanguagePack,
  NotFoundError,
  ContractViolationError,
};
