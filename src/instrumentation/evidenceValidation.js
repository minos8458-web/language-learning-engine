'use strict';

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'INVALID_ID';
  }
}

class MissingRequiredFieldError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingRequiredFieldError';
    this.code = 'MISSING_REQUIRED_FIELD';
  }
}

class UnauthorizedCallerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedCallerError';
    this.code = 'UNAUTHORIZED_CALLER';
  }
}

class OutOfRangeValueError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OutOfRangeValueError';
    this.code = 'OUT_OF_RANGE_VALUE';
  }
}

class ContractViolationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContractViolationError';
    this.code = 'CONTRACT_VIOLATION';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const REFERENCE_KINDS = Object.freeze([
  'ITEM',
  'SCENARIO',
  'ITEM_FAMILY',
  'LEXICAL_MANIFEST',
  'RUBRIC',
  'FORMULA',
  'SCHEDULER_PROTOCOL',
  'INSTRUMENTATION_PROTOCOL',
]);

const CONDITION_CLASSES = Object.freeze([
  'ENGINEERING_BASELINE',
  'PRIMARY_CONTROL',
  'EXPERIMENTAL',
]);

const ASSIGNMENT_TYPES = Object.freeze(['LEARNING', 'REVIEW', 'ASSESSMENT']);
const TARGET_TIMEPOINTS = Object.freeze([
  'IMMEDIATE',
  'DAY_7',
  'DAY_30',
  'NOT_APPLICABLE',
]);
const ANCHOR_STRATEGIES = Object.freeze([
  'NODE_ASSIGNMENT_COMPLETION',
  'QUALIFYING_CRITERION_EVENT',
  'GROUPED_LEARNING_BLOCK_COMPLETION',
]);
const STIMULUS_MODALITIES = Object.freeze(['TEXT', 'AUDIO', 'IMAGE', 'VIDEO']);
const RESPONSE_MODALITIES = Object.freeze([
  'TEXT_ENTRY',
  'SELECTION',
  'STRUCTURED_ACTION',
  'SPEECH',
]);
const RESPONSE_KINDS = Object.freeze(['TEXT', 'JSON', 'REFERENCE', 'NORMAL_EMPTY']);
const TIMING_PROFILES = Object.freeze(['FULL', 'RESPONSE_ONLY', 'NONE']);
const DURATION_MISMATCH_BEHAVIORS = Object.freeze(['REJECT', 'MARK_INVALID']);
const CORRECTION_COVERAGE_MODES = Object.freeze([
  'COMPLETE_BUCKET_SET',
  'NOT_COLLECTED',
]);
const MODALITY_COVERAGE_RULES = Object.freeze([
  'EXACT_PLANNED',
  'NONEMPTY_SUBSET_OF_PLANNED',
]);
const RUBRIC_SCORE_MODES = Object.freeze(['BINARY', 'NON_BINARY']);
const CLASSIFICATION_VOCABULARY = Object.freeze([
  'NO_ERROR',
  'LINGUISTIC_ERROR',
  'TASK_INSTRUCTION_MISUNDERSTANDING',
  'MODALITY_INPUT_FAILURE',
  'NO_EVALUABLE_RESPONSE',
  'UNCLASSIFIED',
]);
const LINGUISTIC_CATEGORY_VOCABULARY = Object.freeze([
  'FORM',
  'WORD_ORDER',
  'LEXICAL_CHOICE',
  'OTHER',
]);
const ATTRIBUTION_RELATION_VOCABULARY = Object.freeze([
  'TARGET',
  'PREREQUISITE',
  'CONTRAST',
  'UNRESOLVED',
]);
const CORRECTION_INITIATORS = Object.freeze(['LEARNER', 'SYSTEM']);
const FEEDBACK_PHASES = Object.freeze(['PRE_FEEDBACK', 'POST_FEEDBACK']);
const CORRECTION_OUTCOMES = Object.freeze([
  'SUCCESSFUL',
  'UNSUCCESSFUL',
  'UNKNOWN',
]);
const MAX_POSTGRES_INTEGER = 2147483647;

const DIRECT_PII_KEYS = new Set([
  'name',
  'fullname',
  'firstname',
  'lastname',
  'email',
  'emailaddress',
  'phone',
  'phonenumber',
  'mobile',
  'address',
  'postaladdress',
  'contact',
  'contactinfo',
  'credential',
  'credentials',
  'password',
  'oauthsubject',
  'accountid',
  'userid',
  'deviceid',
  'reidentificationsecret',
  'reidentificationkey',
]);

function canonicalKey(key) {
  return String(key).replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateInputObject(value, fieldName = 'input') {
  if (value === undefined) {
    throw new MissingRequiredFieldError(`${fieldName} is required`);
  }
  if (!isPlainObject(value)) {
    throw new ContractViolationError(`${fieldName} must be a plain object`);
  }
  return value;
}

function requireField(input, fieldName) {
  validateInputObject(input);
  if (!hasOwn(input, fieldName) || input[fieldName] === undefined) {
    throw new MissingRequiredFieldError(`${fieldName} is required`);
  }
  return input[fieldName];
}

function assertAllowedKeys(input, allowedKeys, fieldName = 'input') {
  validateInputObject(input, fieldName);
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) {
      throw new ContractViolationError(`${fieldName}.${key} is not allowed`);
    }
  }
}

function assertExactKeys(input, requiredKeys, fieldName = 'input') {
  validateInputObject(input, fieldName);
  assertAllowedKeys(input, requiredKeys, fieldName);
  for (const key of requiredKeys) {
    if (!hasOwn(input, key)) {
      throw new MissingRequiredFieldError(`${fieldName}.${key} is required`);
    }
    if (input[key] === undefined) {
      throw new ContractViolationError(`${fieldName}.${key} must not be undefined`);
    }
  }
}

function assertExactDefinitionKeys(input, requiredKeys, fieldName) {
  if (!isPlainObject(input)) {
    throw new ContractViolationError(`${fieldName} must be a plain object`);
  }
  const actualKeys = Object.keys(input);
  if (
    actualKeys.length !== requiredKeys.length
    || actualKeys.some((key) => !requiredKeys.includes(key))
    || requiredKeys.some((key) => !hasOwn(input, key) || input[key] === undefined)
  ) {
    throw new ContractViolationError(`${fieldName} must have exactly the required keys`);
  }
}

function rejectServerIssuedFieldOverrides(input, fields) {
  validateInputObject(input);
  for (const field of fields) {
    if (hasOwn(input, field)) {
      throw new ContractViolationError(`${field} is server-issued and cannot be overridden`);
    }
  }
}

function validateStableId(value, fieldName) {
  if (value === undefined) {
    throw new MissingRequiredFieldError(`${fieldName} is required`);
  }
  if (value === null || typeof value !== 'string') {
    throw new ContractViolationError(`${fieldName} must be a string`);
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ContractViolationError(`${fieldName} must be nonempty after trimming`);
  }
  return normalized;
}

function validateOptionalStableId(value, fieldName) {
  if (value === undefined || value === null) return null;
  return validateStableId(value, fieldName);
}

function validateUuid(value, fieldName) {
  if (value === undefined) {
    throw new MissingRequiredFieldError(`${fieldName} is required`);
  }
  if (value === null || typeof value !== 'string') {
    throw new ContractViolationError(`${fieldName} must be a UUID string`);
  }
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) {
    throw new NotFoundError(`Invalid ${fieldName}: ${value}`);
  }
  return normalized.toLowerCase();
}

function validatePositiveVersion(value, fieldName) {
  if (value === undefined) {
    throw new MissingRequiredFieldError(`${fieldName} is required`);
  }
  if (value === null || typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ContractViolationError(`${fieldName} must be an integer`);
  }
  if (value <= 0) {
    throw new OutOfRangeValueError(`${fieldName} must be greater than zero`);
  }
  return value;
}

function validateNonnegativeSafeInteger(value, fieldName, { postgresInteger = false } = {}) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    if (typeof value === 'number' && Number.isInteger(value)) {
      throw new OutOfRangeValueError(`${fieldName} must be a safe integer`);
    }
    throw new ContractViolationError(`${fieldName} must be an integer`);
  }
  if (value < 0 || (postgresInteger && value > MAX_POSTGRES_INTEGER)) {
    throw new OutOfRangeValueError(`${fieldName} is outside the supported range`);
  }
  return value;
}

function validatePositiveSafeInteger(value, fieldName, hardMaximum) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new ContractViolationError(`${fieldName} must be an integer`);
  }
  if (value <= 0 || value > hardMaximum) {
    throw new ContractViolationError(`${fieldName} is outside the protocol definition range`);
  }
  return value;
}

function validateReferenceKind(value) {
  const normalized = validateStableId(value, 'referenceKind');
  if (!REFERENCE_KINDS.includes(normalized)) {
    throw new ContractViolationError(`Unsupported referenceKind: ${normalized}`);
  }
  return normalized;
}

function validateConditionClass(value) {
  const normalized = validateStableId(value, 'conditionClass');
  if (!CONDITION_CLASSES.includes(normalized)) {
    throw new ContractViolationError(`Unsupported conditionClass: ${normalized}`);
  }
  return normalized;
}

function validateAssignmentType(value) {
  const normalized = validateStableId(value, 'assignmentType');
  if (!ASSIGNMENT_TYPES.includes(normalized)) {
    throw new ContractViolationError(`Unsupported assignmentType: ${normalized}`);
  }
  return normalized;
}

function validateTargetTimepoint(value) {
  const normalized = validateStableId(value, 'targetTimepoint');
  if (!TARGET_TIMEPOINTS.includes(normalized)) {
    throw new ContractViolationError(`Unsupported targetTimepoint: ${normalized}`);
  }
  return normalized;
}

function validateAnchorStrategy(value) {
  const normalized = validateStableId(value, 'anchorStrategy');
  if (!ANCHOR_STRATEGIES.includes(normalized)) {
    throw new ContractViolationError(`Unsupported anchorStrategy: ${normalized}`);
  }
  return normalized;
}

function validateDefinition(value, fieldName = 'definition') {
  if (value === undefined) {
    throw new MissingRequiredFieldError(`${fieldName} is required`);
  }
  if (!isPlainObject(value)) {
    throw new ContractViolationError(`${fieldName} must be a plain object`);
  }
  return value;
}

function validateOptionalString(value, fieldName) {
  if (value === undefined || value === null) return null;
  return validateStableId(value, fieldName);
}

function validateModalityArray(value, fieldName, allowedValues) {
  if (value === undefined) {
    throw new MissingRequiredFieldError(`${fieldName} is required`);
  }
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError(`${fieldName} must be an array`);
  }
  if (value.length === 0 || value.length > 4) {
    throw new OutOfRangeValueError(`${fieldName} must contain between 1 and 4 components`);
  }

  const seen = new Set();
  const normalized = [];
  for (const component of value) {
    if (typeof component !== 'string' || component.trim().length === 0) {
      throw new ContractViolationError(`${fieldName} components must be nonempty strings`);
    }
    const item = component.trim();
    if (!allowedValues.includes(item) || item === 'MIXED') {
      throw new ContractViolationError(`Unsupported ${fieldName} component: ${item}`);
    }
    if (seen.has(item)) {
      throw new ContractViolationError(`${fieldName} contains duplicate component: ${item}`);
    }
    seen.add(item);
    normalized.push(item);
  }
  return normalized;
}

function validateClosedEnumArray(value, fieldName, allowedValues) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ContractViolationError(`${fieldName} must be a nonempty array`);
  }
  const seen = new Set();
  const normalized = [];
  for (const item of value) {
    if (
      typeof item !== 'string'
      || item !== item.trim()
      || !allowedValues.includes(item)
      || seen.has(item)
    ) {
      throw new ContractViolationError(`${fieldName} contains an invalid or duplicate value`);
    }
    seen.add(item);
    normalized.push(item);
  }
  return normalized;
}

function arraysEqual(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function validateInstrumentationProtocolDefinition(value) {
  const fieldName = 'instrumentationProtocolDefinition';
  assertExactDefinitionKeys(value, [
    'definitionType',
    'definitionVersion',
    'timingPolicy',
    'correctionCoverageMode',
    'responseBounds',
    'modalityPolicy',
  ], fieldName);
  if (
    value.definitionType !== 'EVIDENCE_INSTRUMENTATION_PROTOCOL'
    || value.definitionVersion !== 1
  ) {
    throw new ContractViolationError(`${fieldName} has invalid type or version`);
  }

  assertExactDefinitionKeys(value.timingPolicy, [
    'collectionProfile',
    'durationConsistencyToleranceMs',
    'durationMismatchBehavior',
  ], `${fieldName}.timingPolicy`);
  const { timingPolicy } = value;
  if (
    !TIMING_PROFILES.includes(timingPolicy.collectionProfile)
    || !DURATION_MISMATCH_BEHAVIORS.includes(timingPolicy.durationMismatchBehavior)
  ) {
    throw new ContractViolationError(`${fieldName}.timingPolicy has an invalid enum`);
  }
  const tolerance = timingPolicy.durationConsistencyToleranceMs;
  if (typeof tolerance !== 'number' || !Number.isSafeInteger(tolerance) || tolerance < 0) {
    throw new ContractViolationError(
      `${fieldName}.timingPolicy.durationConsistencyToleranceMs is invalid`
    );
  }
  if (
    timingPolicy.collectionProfile === 'NONE'
    && (tolerance !== 0 || timingPolicy.durationMismatchBehavior !== 'REJECT')
  ) {
    throw new ContractViolationError(`${fieldName}.timingPolicy NONE policy is invalid`);
  }

  if (!CORRECTION_COVERAGE_MODES.includes(value.correctionCoverageMode)) {
    throw new ContractViolationError(`${fieldName}.correctionCoverageMode is invalid`);
  }

  assertExactDefinitionKeys(value.responseBounds, [
    'textMaxUtf8Bytes',
    'referenceMaxUtf8Bytes',
    'jsonMaxUtf8Bytes',
  ], `${fieldName}.responseBounds`);
  const responseBounds = {
    textMaxUtf8Bytes: validatePositiveSafeInteger(
      value.responseBounds.textMaxUtf8Bytes,
      `${fieldName}.responseBounds.textMaxUtf8Bytes`,
      65536
    ),
    referenceMaxUtf8Bytes: validatePositiveSafeInteger(
      value.responseBounds.referenceMaxUtf8Bytes,
      `${fieldName}.responseBounds.referenceMaxUtf8Bytes`,
      2048
    ),
    jsonMaxUtf8Bytes: validatePositiveSafeInteger(
      value.responseBounds.jsonMaxUtf8Bytes,
      `${fieldName}.responseBounds.jsonMaxUtf8Bytes`,
      65536
    ),
  };

  assertExactDefinitionKeys(value.modalityPolicy, [
    'allowedStimulusModalities',
    'allowedResponseModalities',
    'stimulusCoverage',
    'responseCoverage',
  ], `${fieldName}.modalityPolicy`);
  const modalityPolicy = {
    allowedStimulusModalities: validateClosedEnumArray(
      value.modalityPolicy.allowedStimulusModalities,
      `${fieldName}.modalityPolicy.allowedStimulusModalities`,
      STIMULUS_MODALITIES
    ),
    allowedResponseModalities: validateClosedEnumArray(
      value.modalityPolicy.allowedResponseModalities,
      `${fieldName}.modalityPolicy.allowedResponseModalities`,
      RESPONSE_MODALITIES
    ),
    stimulusCoverage: value.modalityPolicy.stimulusCoverage,
    responseCoverage: value.modalityPolicy.responseCoverage,
  };
  if (
    !MODALITY_COVERAGE_RULES.includes(modalityPolicy.stimulusCoverage)
    || !MODALITY_COVERAGE_RULES.includes(modalityPolicy.responseCoverage)
  ) {
    throw new ContractViolationError(`${fieldName}.modalityPolicy coverage is invalid`);
  }

  return {
    definitionType: value.definitionType,
    definitionVersion: value.definitionVersion,
    timingPolicy: {
      collectionProfile: timingPolicy.collectionProfile,
      durationConsistencyToleranceMs: tolerance,
      durationMismatchBehavior: timingPolicy.durationMismatchBehavior,
    },
    correctionCoverageMode: value.correctionCoverageMode,
    responseBounds,
    modalityPolicy,
  };
}

function validateStableIdList(value, fieldName, { nonempty = false } = {}) {
  if (!Array.isArray(value) || (nonempty && value.length === 0)) {
    throw new ContractViolationError(`${fieldName} must be ${nonempty ? 'a nonempty ' : 'an '}array`);
  }
  const seen = new Set();
  return value.map((item) => {
    if (typeof item !== 'string' || item.length === 0 || item !== item.trim() || seen.has(item)) {
      throw new ContractViolationError(`${fieldName} contains an invalid or duplicate stable ID`);
    }
    seen.add(item);
    return item;
  });
}

function validateRubricDefinition(value, targetNodeIds) {
  const fieldName = 'rubricDefinition';
  assertExactDefinitionKeys(value, [
    'definitionType',
    'definitionVersion',
    'scoreMode',
    'classificationVocabulary',
    'linguisticCategoryVocabulary',
    'attributionRelationVocabulary',
    'rubricRuleIds',
    'attributionAuthority',
  ], fieldName);
  if (
    value.definitionType !== 'EVIDENCE_ERROR_CLASSIFICATION_RUBRIC'
    || value.definitionVersion !== 1
    || !RUBRIC_SCORE_MODES.includes(value.scoreMode)
    || !arraysEqual(value.classificationVocabulary, CLASSIFICATION_VOCABULARY)
    || !arraysEqual(value.linguisticCategoryVocabulary, LINGUISTIC_CATEGORY_VOCABULARY)
    || !arraysEqual(value.attributionRelationVocabulary, ATTRIBUTION_RELATION_VOCABULARY)
  ) {
    throw new ContractViolationError(`${fieldName} has an invalid constant or vocabulary`);
  }
  const rubricRuleIds = validateStableIdList(
    value.rubricRuleIds,
    `${fieldName}.rubricRuleIds`,
    { nonempty: true }
  );

  assertExactDefinitionKeys(
    value.attributionAuthority,
    ['byTargetNode'],
    `${fieldName}.attributionAuthority`
  );
  const byTargetNode = value.attributionAuthority.byTargetNode;
  if (!isPlainObject(byTargetNode)) {
    throw new ContractViolationError(`${fieldName}.attributionAuthority.byTargetNode is invalid`);
  }
  const authorityNodeIds = Object.keys(byTargetNode).sort();
  if (targetNodeIds.some((nodeId) => !hasOwn(byTargetNode, nodeId))) {
    throw new ContractViolationError(`${fieldName} target authority coverage is invalid`);
  }

  const normalizedAuthority = Object.create(null);
  for (const nodeId of authorityNodeIds) {
    if (typeof nodeId !== 'string' || nodeId.length === 0 || nodeId !== nodeId.trim()) {
      throw new ContractViolationError(`${fieldName} contains an invalid target stable ID`);
    }
    const authority = byTargetNode[nodeId];
    assertExactDefinitionKeys(
      authority,
      ['prerequisiteNodeIds', 'contrastNodeIds'],
      `${fieldName}.attributionAuthority.byTargetNode.${nodeId}`
    );
    normalizedAuthority[nodeId] = {
      prerequisiteNodeIds: validateStableIdList(
        authority.prerequisiteNodeIds,
        `${fieldName}.attributionAuthority.byTargetNode.${nodeId}.prerequisiteNodeIds`
      ),
      contrastNodeIds: validateStableIdList(
        authority.contrastNodeIds,
        `${fieldName}.attributionAuthority.byTargetNode.${nodeId}.contrastNodeIds`
      ),
    };
  }

  return {
    definitionType: value.definitionType,
    definitionVersion: value.definitionVersion,
    scoreMode: value.scoreMode,
    classificationVocabulary: CLASSIFICATION_VOCABULARY,
    linguisticCategoryVocabulary: LINGUISTIC_CATEGORY_VOCABULARY,
    attributionRelationVocabulary: ATTRIBUTION_RELATION_VOCABULARY,
    rubricRuleIds,
    attributionAuthority: { byTargetNode: normalizedAuthority },
  };
}

function validateStimulusModalities(value, fieldName = 'plannedStimulusModalities') {
  return validateModalityArray(value, fieldName, STIMULUS_MODALITIES);
}

function validateResponseModalities(value, fieldName = 'plannedResponseModalities') {
  return validateModalityArray(value, fieldName, RESPONSE_MODALITIES);
}

function validateTargetNodeIds(value) {
  if (value === undefined) {
    throw new MissingRequiredFieldError('targetNodeIds is required');
  }
  if (value === null || !Array.isArray(value)) {
    throw new ContractViolationError('targetNodeIds must be an array');
  }
  if (value.length === 0) {
    throw new OutOfRangeValueError('targetNodeIds must contain at least one node');
  }

  const seen = new Set();
  const normalized = [];
  for (const nodeId of value) {
    const item = validateStableId(nodeId, 'targetNodeIds[]');
    if (seen.has(item)) {
      throw new ContractViolationError(`Duplicate target node: ${item}`);
    }
    seen.add(item);
    normalized.push(item);
  }
  return normalized;
}

function validatePartialReference(input, idField, versionField, { optional = false } = {}) {
  validateInputObject(input);
  const hasId = hasOwn(input, idField) && input[idField] !== undefined;
  const hasVersion = hasOwn(input, versionField) && input[versionField] !== undefined;

  if (!hasId && !hasVersion) {
    if (optional) return null;
    throw new MissingRequiredFieldError(`${idField} and ${versionField} are required`);
  }
  if (hasId !== hasVersion || input[idField] === null || input[versionField] === null) {
    throw new ContractViolationError(`${idField} and ${versionField} must be supplied together`);
  }

  return {
    id: validateStableId(input[idField], idField),
    version: validatePositiveVersion(input[versionField], versionField),
  };
}

function rejectDirectPiiKeys(value, path = 'input') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectDirectPiiKeys(item, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) return;

  for (const [key, child] of Object.entries(value)) {
    if (DIRECT_PII_KEYS.has(canonicalKey(key))) {
      throw new ContractViolationError(`Direct PII key is prohibited: ${path}.${key}`);
    }
    rejectDirectPiiKeys(child, `${path}.${key}`);
  }
}

module.exports = {
  ANCHOR_STRATEGIES,
  ASSIGNMENT_TYPES,
  ATTRIBUTION_RELATION_VOCABULARY,
  CLASSIFICATION_VOCABULARY,
  CONDITION_CLASSES,
  ContractViolationError,
  CORRECTION_COVERAGE_MODES,
  CORRECTION_INITIATORS,
  CORRECTION_OUTCOMES,
  DURATION_MISMATCH_BEHAVIORS,
  FEEDBACK_PHASES,
  LINGUISTIC_CATEGORY_VOCABULARY,
  MissingRequiredFieldError,
  MODALITY_COVERAGE_RULES,
  NotFoundError,
  OutOfRangeValueError,
  REFERENCE_KINDS,
  RESPONSE_KINDS,
  RESPONSE_MODALITIES,
  RUBRIC_SCORE_MODES,
  STIMULUS_MODALITIES,
  TARGET_TIMEPOINTS,
  TIMING_PROFILES,
  UnauthorizedCallerError,
  assertAllowedKeys,
  assertExactKeys,
  hasOwn,
  isPlainObject,
  rejectDirectPiiKeys,
  rejectServerIssuedFieldOverrides,
  requireField,
  validateAnchorStrategy,
  validateAssignmentType,
  validateConditionClass,
  validateDefinition,
  validateInputObject,
  validateInstrumentationProtocolDefinition,
  validateNonnegativeSafeInteger,
  validateOptionalStableId,
  validateOptionalString,
  validatePartialReference,
  validatePositiveVersion,
  validateReferenceKind,
  validateResponseModalities,
  validateRubricDefinition,
  validateStableId,
  validateStimulusModalities,
  validateTargetNodeIds,
  validateTargetTimepoint,
  validateUuid,
};
