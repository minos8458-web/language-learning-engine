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
  CONDITION_CLASSES,
  ContractViolationError,
  MissingRequiredFieldError,
  NotFoundError,
  OutOfRangeValueError,
  REFERENCE_KINDS,
  RESPONSE_MODALITIES,
  STIMULUS_MODALITIES,
  TARGET_TIMEPOINTS,
  UnauthorizedCallerError,
  assertAllowedKeys,
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
  validateOptionalStableId,
  validateOptionalString,
  validatePartialReference,
  validatePositiveVersion,
  validateReferenceKind,
  validateResponseModalities,
  validateStableId,
  validateStimulusModalities,
  validateTargetNodeIds,
  validateTargetTimepoint,
  validateUuid,
};
