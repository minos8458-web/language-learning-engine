// src/engines/learningFlowEngine.js
//
// AC-014/AC-016: REVIEW -> NEW_GRAMMAR -> INTERLEAVING -> CONVERSATION -> IDLE
// priority chain. This orchestration layer owns no persistence and calls only the
// canonical Graph, Progress, and Interleaving Engine APIs.

const graphEngine = require('./graphEngine');
const progressEngine = require('./progressEngine');
const interleavingEngine = require('./interleavingEngine');
const {
  ACTIVE_NODE_LIMIT,
  INTERLEAVING_LIMITS,
  SESSION_BUDGET_MODES,
  SESSION_BUDGET_MODE,
  CONVERSATION_PRACTICING_PLUS_THRESHOLD,
} = require('../config/engineConfig');

const ACTIVE_INTERLEAVING_STATES = new Set(['INTRODUCED', 'STUDYING']);
const SATISFIED_PREREQUISITE_STATES = new Set(['MASTERED', 'AUTOMATIC']);

function validateConversationBoundaryAcknowledged(value) {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new graphEngine.ContractViolationError(
      'conversationBoundaryAcknowledged는 boolean이어야 합니다'
    );
  }
  return value === true;
}

function exactReviewItem(item) {
  return {
    node_id: item.node_id,
    state: item.state,
    next_review_at: item.next_review_at,
    overdue_by: item.overdue_by,
    priority: item.priority,
    reason: item.reason,
  };
}

function compareNodeCandidates(left, right) {
  if (left.difficulty !== right.difficulty) return left.difficulty - right.difficulty;
  if (left.node_id < right.node_id) return -1;
  if (left.node_id > right.node_id) return 1;
  return 0;
}

function combinations(values, size) {
  const result = [];
  const current = [];

  function visit(startIndex) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    const remainingNeeded = size - current.length;
    for (let index = startIndex; index <= values.length - remainingNeeded; index += 1) {
      current.push(values[index]);
      visit(index + 1);
      current.pop();
    }
  }

  visit(0);
  return result;
}

function compareArrays(left, right) {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }
  return left.length - right.length;
}

function compareSelectionTuples(left, right) {
  for (let index = 0; index < left.length - 1; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return compareArrays(left[left.length - 1], right[right.length - 1]);
}

function isCategoryAdmissible(nodeIds, categoriesByNode) {
  const counts = new Map();
  for (const nodeId of nodeIds) {
    for (const category of categoriesByNode.get(nodeId)) {
      counts.set(category, (counts.get(category) || 0) + 1);
    }
  }
  const maximumPerCategory = Math.floor(nodeIds.length / INTERLEAVING_LIMITS.baseRepeats);
  return [...counts.values()].every((count) => count <= maximumPerCategory);
}

function categoryDiversity(nodeIds, categoriesByNode) {
  const categories = new Set();
  for (const nodeId of nodeIds) {
    for (const category of categoriesByNode.get(nodeId)) categories.add(category);
  }
  return categories.size;
}

function contrastPairCount(nodeIds, contrastPairKeys) {
  let count = 0;
  for (let leftIndex = 0; leftIndex < nodeIds.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < nodeIds.length; rightIndex += 1) {
      if (contrastPairKeys.has(`${nodeIds[leftIndex]}\u0000${nodeIds[rightIndex]}`)) count += 1;
    }
  }
  return count;
}

function selectInterleavingSet(eligibleNodeIds, categoriesByNode, contrastPairKeys) {
  const maximumSelectedNodeCount = Math.floor(
    INTERLEAVING_LIMITS.maxBatchSize / INTERLEAVING_LIMITS.baseRepeats
  );
  const minimumSelectedNodeCount = maximumSelectedNodeCount - 1;
  let bestSet = null;
  let bestTuple = null;

  for (
    let size = maximumSelectedNodeCount;
    size >= minimumSelectedNodeCount;
    size -= 1
  ) {
    if (eligibleNodeIds.length < size) continue;
    for (const nodeIds of combinations(eligibleNodeIds, size)) {
      if (!isCategoryAdmissible(nodeIds, categoriesByNode)) continue;
      const tuple = [
        -nodeIds.length,
        -contrastPairCount(nodeIds, contrastPairKeys),
        -categoryDiversity(nodeIds, categoriesByNode),
        nodeIds,
      ];
      if (bestTuple === null || compareSelectionTuples(tuple, bestTuple) < 0) {
        bestTuple = tuple;
        bestSet = nodeIds;
      }
    }
  }
  return bestSet;
}

async function chooseNewGrammar(pool, userId, nodes, progressSnapshot) {
  const candidates = nodes
    .filter((node) => progressSnapshot[node.node_id] === 'NOT_INTRODUCED')
    .sort(compareNodeCandidates);
  if (candidates.length === 0) return null;

  const { active_count: activeCount } = await progressEngine.getActiveLearningCount(
    pool,
    userId,
    nodes[0].language
  );
  if (activeCount >= ACTIVE_NODE_LIMIT.maxConcurrentIntroducedOrStudying) return null;

  const maximumPrerequisiteDepth = Math.max(nodes.length, 1);
  for (const candidate of candidates) {
    const prerequisiteNodeIds = await graphEngine.findPrerequisites(
      pool,
      candidate.node_id,
      maximumPrerequisiteDepth
    );
    const prerequisitesSatisfied = prerequisiteNodeIds.every((nodeId) =>
      SATISFIED_PREREQUISITE_STATES.has(progressSnapshot[nodeId])
    );
    if (prerequisitesSatisfied) return candidate.node_id;
  }
  return null;
}

async function chooseInterleaving(pool, nodes, progressSnapshot) {
  const nodeById = new Map(nodes.map((node) => [node.node_id, node]));
  const eligibleNodeIds = [...new Set(
    nodes
      .filter((node) => ACTIVE_INTERLEAVING_STATES.has(progressSnapshot[node.node_id]))
      .map((node) => node.node_id)
  )].sort();

  const maximumSelectedNodeCount = Math.floor(
    INTERLEAVING_LIMITS.maxBatchSize / INTERLEAVING_LIMITS.baseRepeats
  );
  if (eligibleNodeIds.length < maximumSelectedNodeCount - 1) return null;

  const conceptIds = [...new Set(
    eligibleNodeIds.flatMap((nodeId) => nodeById.get(nodeId).concept_ids)
  )];
  const categoryByConcept = await graphEngine.getConceptCategories(pool, conceptIds);
  const categoriesByNode = new Map(
    eligibleNodeIds.map((nodeId) => [
      nodeId,
      new Set(nodeById.get(nodeId).concept_ids.map((conceptId) => categoryByConcept[conceptId])),
    ])
  );

  const eligibleSet = new Set(eligibleNodeIds);
  const contrastPairKeys = new Set();
  for (const nodeId of eligibleNodeIds) {
    const related = await graphEngine.findRelatedNodes(pool, nodeId, 'CONTRAST');
    for (const relation of related) {
      if (!eligibleSet.has(relation.related_node_id) || relation.related_node_id === nodeId) continue;
      const pair = [nodeId, relation.related_node_id].sort();
      contrastPairKeys.add(`${pair[0]}\u0000${pair[1]}`);
    }
  }

  const selectedNodeIds = selectInterleavingSet(
    eligibleNodeIds,
    categoriesByNode,
    contrastPairKeys
  );
  if (selectedNodeIds === null) return null;

  const occurrenceMultiset = selectedNodeIds.flatMap((nodeId) =>
    Array(INTERLEAVING_LIMITS.baseRepeats).fill(nodeId)
  );
  return interleavingEngine.sequenceNodes(pool, occurrenceMultiset);
}

async function startSession(pool, userId, language, conversationBoundaryAcknowledged) {
  const boundaryAcknowledged = validateConversationBoundaryAcknowledged(
    conversationBoundaryAcknowledged
  );

  const reviewBatch = await progressEngine.getDueReviews(pool, userId, language, new Date());
  if (reviewBatch.length > 0) {
    return {
      next_action: 'REVIEW',
      review_batch: reviewBatch.map(exactReviewItem),
    };
  }

  const nodes = await graphEngine.listNodesByLanguage(pool, language);
  const progressSnapshot = await progressEngine.getProgressSnapshot(
    pool,
    userId,
    nodes.map((node) => node.node_id)
  );

  const newGrammarNodeId = await chooseNewGrammar(pool, userId, nodes, progressSnapshot);
  if (newGrammarNodeId !== null) {
    return { next_action: 'NEW_GRAMMAR', node_id: newGrammarNodeId };
  }

  const nodeSequence = await chooseInterleaving(pool, nodes, progressSnapshot);
  if (nodeSequence !== null) {
    return { next_action: 'INTERLEAVING', node_sequence: nodeSequence };
  }

  const { count: practicingPlusCount } = await progressEngine.getPracticingPlusCount(
    pool,
    userId,
    language
  );
  if (
    practicingPlusCount >= CONVERSATION_PRACTICING_PLUS_THRESHOLD &&
    SESSION_BUDGET_MODE === SESSION_BUDGET_MODES.UNBOUNDED_UNTIL_INPUT_AVAILABLE &&
    !boundaryAcknowledged
  ) {
    return { next_action: 'CONVERSATION' };
  }

  return { next_action: 'IDLE' };
}

module.exports = {
  startSession,
};
