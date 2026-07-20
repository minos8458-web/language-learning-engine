// Shared production contract between a learning-session client and its transport.
// The transport preserves canonical server error codes while identifying the one
// CONTRACT_VIOLATION origin for which CLIENT_BRIEF §2 requires a fresh decision.

class CapacityAdmissionConflictError extends Error {
  constructor(cause) {
    super(cause.message, { cause });
    this.name = 'CapacityAdmissionConflictError';
    this.code = cause.code;
  }
}

function assertLearningFlowTransport(transport) {
  if (
    transport === null ||
    typeof transport !== 'object' ||
    typeof transport.startSession !== 'function' ||
    typeof transport.startExplicitStudy !== 'function'
  ) {
    throw new TypeError('transport must implement startSession and startExplicitStudy');
  }
}

module.exports = {
  CapacityAdmissionConflictError,
  assertLearningFlowTransport,
};
