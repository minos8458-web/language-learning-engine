// Minimal production transport for deployments that host client and server
// boundaries in one Node.js process. A future HTTP adapter can implement the same
// client contract without exposing Engine internals to the client controller.

const learningFlowEngine = require('../engines/learningFlowEngine');
const progressEngine = require('../engines/progressEngine');
const {
  CapacityAdmissionConflictError,
} = require('../client/learningFlowTransportContract');

const CAPACITY_REJECTION_PREFIX = 'active Grammar Node limit 초과:';

function isAuthoritativeCapacityRejection(error) {
  return (
    error instanceof progressEngine.ContractViolationError &&
    typeof error.message === 'string' &&
    error.message.startsWith(CAPACITY_REJECTION_PREFIX)
  );
}

class InProcessLearningFlowTransport {
  constructor(pool) {
    if (pool === null || typeof pool !== 'object') {
      throw new TypeError('pool is required');
    }
    this.pool = pool;
  }

  startSession(userId, language, conversationBoundaryAcknowledged) {
    return learningFlowEngine.startSession(
      this.pool,
      userId,
      language,
      conversationBoundaryAcknowledged
    );
  }

  async startExplicitStudy(userId, nodeId) {
    try {
      return await progressEngine.recordExplicitStudy(
        this.pool,
        userId,
        nodeId,
        new Date().toISOString()
      );
    } catch (error) {
      if (isAuthoritativeCapacityRejection(error)) {
        throw new CapacityAdmissionConflictError(error);
      }
      throw error;
    }
  }
}

module.exports = {
  InProcessLearningFlowTransport,
};
