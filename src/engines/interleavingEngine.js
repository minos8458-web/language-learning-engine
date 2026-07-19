// src/engines/interleavingEngine.js
//
// AC-014/AC-015: 입력 occurrence multiset의 구성과 multiplicity를 보존하면서
// canonical lexicographic tuple의 최솟값을 갖는 순서만 결정한다.

const graphEngine = require('./graphEngine');
const { INTERLEAVING_LIMITS } = require('../config/engineConfig');

const {
  ContractViolationError,
  MissingRequiredFieldError,
  OutOfRangeValueError,
} = graphEngine;

function validateNodeIds(nodeIds) {
  if (nodeIds === undefined) {
    throw new MissingRequiredFieldError('node_ids는 필수입니다');
  }
  if (nodeIds === null || !Array.isArray(nodeIds)) {
    throw new ContractViolationError('node_ids는 string[]이어야 합니다');
  }
  for (const nodeId of nodeIds) {
    if (typeof nodeId !== 'string' || nodeId.trim().length === 0) {
      throw new ContractViolationError(
        'node_ids의 모든 원소는 비어 있지 않은 문자열이어야 합니다'
      );
    }
  }
}

function uniqueMultisetPermutations(nodeIds) {
  const counts = new Map();
  for (const nodeId of nodeIds) counts.set(nodeId, (counts.get(nodeId) || 0) + 1);
  const keys = [...counts.keys()].sort();
  const permutations = [];
  const current = [];

  function visit() {
    if (current.length === nodeIds.length) {
      permutations.push([...current]);
      return;
    }
    for (const nodeId of keys) {
      const remaining = counts.get(nodeId);
      if (remaining === 0) continue;
      counts.set(nodeId, remaining - 1);
      current.push(nodeId);
      visit();
      current.pop();
      counts.set(nodeId, remaining);
    }
  }

  visit();
  return permutations;
}

function hasSharedCategory(left, right, categoriesByNode) {
  const leftCategories = categoriesByNode.get(left);
  const rightCategories = categoriesByNode.get(right);
  for (const category of leftCategories) {
    if (rightCategories.has(category)) return true;
  }
  return false;
}

function minimumOccurrenceDistance(sequence, left, right) {
  let minimum = Infinity;
  for (let leftIndex = 0; leftIndex < sequence.length; leftIndex++) {
    if (sequence[leftIndex] !== left) continue;
    for (let rightIndex = 0; rightIndex < sequence.length; rightIndex++) {
      if (sequence[rightIndex] !== right) continue;
      minimum = Math.min(minimum, Math.abs(leftIndex - rightIndex));
    }
  }
  return minimum;
}

function scoreSequence(sequence, categoriesByNode, contrastPairs) {
  let sameNodeAdjacentPairCount = 0;
  let sharedCategoryAdjacentPairCount = 0;

  for (let index = 0; index < sequence.length - 1; index++) {
    const left = sequence[index];
    const right = sequence[index + 1];
    if (left === right) {
      sameNodeAdjacentPairCount += 1;
    } else if (hasSharedCategory(left, right, categoriesByNode)) {
      sharedCategoryAdjacentPairCount += 1;
    }
  }

  let contrastPairMinDistanceSum = 0;
  for (const [left, right] of contrastPairs) {
    contrastPairMinDistanceSum += minimumOccurrenceDistance(sequence, left, right);
  }

  return [
    sameNodeAdjacentPairCount,
    sharedCategoryAdjacentPairCount,
    contrastPairMinDistanceSum,
    sequence,
  ];
}

function compareArrays(left, right) {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index++) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }
  return left.length - right.length;
}

function compareScores(left, right) {
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return compareArrays(left[3], right[3]);
}

async function sequenceNodes(pool, nodeIds) {
  validateNodeIds(nodeIds);
  if (nodeIds.length > INTERLEAVING_LIMITS.maxBatchSize) {
    throw new OutOfRangeValueError(
      `node_ids 길이는 maxBatchSize(${INTERLEAVING_LIMITS.maxBatchSize})를 초과할 수 없습니다`
    );
  }
  if (nodeIds.length === 0) return [];

  const uniqueNodeIds = [...new Set(nodeIds)];
  const metadata = await graphEngine.getNodeLanguageAndConcepts(pool, uniqueNodeIds);
  const languages = new Set(uniqueNodeIds.map((nodeId) => metadata[nodeId].language));
  if (languages.size > 1) {
    throw new ContractViolationError('node_ids는 모두 같은 language여야 합니다');
  }

  const conceptIds = [
    ...new Set(uniqueNodeIds.flatMap((nodeId) => metadata[nodeId].concept_ids)),
  ];
  const categoryByConcept = await graphEngine.getConceptCategories(pool, conceptIds);
  const categoriesByNode = new Map(
    uniqueNodeIds.map((nodeId) => [
      nodeId,
      new Set(metadata[nodeId].concept_ids.map((conceptId) => categoryByConcept[conceptId])),
    ])
  );

  const inputNodeIds = new Set(uniqueNodeIds);
  const contrastPairKeys = new Set();
  for (const nodeId of uniqueNodeIds) {
    const related = await graphEngine.findRelatedNodes(pool, nodeId, 'CONTRAST');
    for (const relation of related) {
      const relatedNodeId = relation.related_node_id;
      if (relatedNodeId === nodeId || !inputNodeIds.has(relatedNodeId)) continue;
      const pair = [nodeId, relatedNodeId].sort();
      contrastPairKeys.add(`${pair[0]}\u0000${pair[1]}`);
    }
  }
  const contrastPairs = [...contrastPairKeys].map((key) => key.split('\u0000'));

  let bestSequence = null;
  let bestScore = null;
  for (const sequence of uniqueMultisetPermutations(nodeIds)) {
    const score = scoreSequence(sequence, categoriesByNode, contrastPairs);
    if (bestScore === null || compareScores(score, bestScore) < 0) {
      bestScore = score;
      bestSequence = sequence;
    }
  }
  return bestSequence;
}

module.exports = {
  sequenceNodes,
  ContractViolationError,
  MissingRequiredFieldError,
  OutOfRangeValueError,
};
