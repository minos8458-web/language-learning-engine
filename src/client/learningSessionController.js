// Production client boundary for CLIENT_BRIEF §2/§7. Each instance represents
// one logical client session and deliberately keeps acknowledgement in memory.

const {
  CapacityAdmissionConflictError,
  assertLearningFlowTransport,
} = require('./learningFlowTransportContract');

const REQUEST_STATUS = Object.freeze({
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  READY: 'READY',
  ERROR: 'ERROR',
});

const SESSION_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
});

const SCREEN_KIND = Object.freeze({
  REVIEW: 'REVIEW',
  NEW_GRAMMAR: 'NEW_GRAMMAR',
  INTERLEAVING: 'INTERLEAVING',
  CONVERSATION_BOUNDARY: 'CONVERSATION_BOUNDARY',
  IDLE: 'IDLE',
});

function screenFor(response) {
  switch (response.next_action) {
    case 'REVIEW':
      return { kind: SCREEN_KIND.REVIEW, reviewBatch: response.review_batch };
    case 'NEW_GRAMMAR':
      return { kind: SCREEN_KIND.NEW_GRAMMAR, nodeId: response.node_id };
    case 'INTERLEAVING':
      return { kind: SCREEN_KIND.INTERLEAVING, nodeSequence: response.node_sequence };
    case 'CONVERSATION':
      return { kind: SCREEN_KIND.CONVERSATION_BOUNDARY };
    case 'IDLE':
      return { kind: SCREEN_KIND.IDLE };
    default:
      throw new TypeError(`unsupported next_action: ${response.next_action}`);
  }
}

function errorState(error) {
  const value = { message: error instanceof Error ? error.message : String(error) };
  if (error && typeof error.code === 'string') value.code = error.code;
  return value;
}

class LearningSessionController {
  #conversationBoundaryAcknowledged;

  constructor({ transport, userId, language }) {
    assertLearningFlowTransport(transport);
    this.transport = transport;
    this.userId = userId;
    this.language = language;
    this.#conversationBoundaryAcknowledged = false;
    this.sessionStatus = SESSION_STATUS.ACTIVE;
    this.requestStatus = REQUEST_STATUS.IDLE;
    this.currentServerAction = null;
    this.currentScreen = null;
    this.error = null;
  }

  getState() {
    return structuredClone({
      sessionStatus: this.sessionStatus,
      requestStatus: this.requestStatus,
      currentServerAction: this.currentServerAction,
      currentScreen: this.currentScreen,
      conversationBoundaryAcknowledged: this.#conversationBoundaryAcknowledged,
      error: this.error,
    });
  }

  async start() {
    return this.#requestLatestDecision();
  }

  async acknowledgeConversationBoundary() {
    if (
      this.sessionStatus !== SESSION_STATUS.ACTIVE ||
      this.requestStatus !== REQUEST_STATUS.READY ||
      this.currentScreen?.kind !== SCREEN_KIND.CONVERSATION_BOUNDARY
    ) {
      throw new TypeError('the conversation boundary is not awaiting acknowledgement');
    }
    this.#conversationBoundaryAcknowledged = true;
    return this.#requestLatestDecision();
  }

  async startProposedExplicitStudy() {
    if (
      this.sessionStatus !== SESSION_STATUS.ACTIVE ||
      this.requestStatus !== REQUEST_STATUS.READY ||
      this.currentScreen?.kind !== SCREEN_KIND.NEW_GRAMMAR
    ) {
      throw new TypeError('there is no NEW_GRAMMAR proposal to admit');
    }

    const nodeId = this.currentScreen.nodeId;
    this.#showLoading();
    try {
      const result = await this.transport.startExplicitStudy(this.userId, nodeId);
      this.requestStatus = REQUEST_STATUS.READY;
      this.currentServerAction = 'NEW_GRAMMAR';
      this.currentScreen = { kind: SCREEN_KIND.NEW_GRAMMAR, nodeId };
      return result;
    } catch (error) {
      if (error instanceof CapacityAdmissionConflictError) {
        return this.#requestLatestDecision();
      }
      this.#showError(error);
      return this.getState();
    }
  }

  endSession() {
    this.sessionStatus = SESSION_STATUS.ENDED;
    this.requestStatus = REQUEST_STATUS.IDLE;
    this.currentServerAction = null;
    this.currentScreen = null;
    this.error = null;
  }

  async #requestLatestDecision() {
    if (this.sessionStatus !== SESSION_STATUS.ACTIVE) {
      throw new TypeError('the logical client session has ended');
    }
    this.#showLoading();
    try {
      const response = await this.transport.startSession(
        this.userId,
        this.language,
        this.#conversationBoundaryAcknowledged
      );
      this.currentServerAction = response.next_action;
      this.currentScreen = screenFor(response);
      this.requestStatus = REQUEST_STATUS.READY;
      this.error = null;
    } catch (error) {
      this.#showError(error);
    }
    return this.getState();
  }

  #showLoading() {
    this.requestStatus = REQUEST_STATUS.LOADING;
    this.currentServerAction = null;
    this.currentScreen = null;
    this.error = null;
  }

  #showError(error) {
    this.requestStatus = REQUEST_STATUS.ERROR;
    this.currentServerAction = null;
    this.currentScreen = null;
    this.error = errorState(error);
  }
}

module.exports = {
  LearningSessionController,
  REQUEST_STATUS,
  SESSION_STATUS,
  SCREEN_KIND,
};
