const { CapacityAdmissionConflictError, assertExplicitStudyResult } = require('./learningFlowTransportContract');

const CAPACITY_REJECTION_PREFIX = 'active Grammar Node limit 초과:';
const PUBLIC_ERRORS = Object.freeze({
  INVALID_ID: '학습 항목을 찾지 못했어요. 다시 학습을 시작해 주세요.',
  MISSING_REQUIRED_FIELD: '학습 요청에 필요한 정보가 빠졌어요.',
  OUT_OF_RANGE_VALUE: '학습 요청의 값을 확인해 주세요.',
  UNAUTHORIZED_CALLER: '이 학습 요청을 처리할 권한이 없어요.',
  CONTRACT_VIOLATION: '학습 상태가 달라졌어요. 최신 상태를 확인해 주세요.',
});

// HTTP 401에서만 생성하며 외부 오류의 이름·메시지·status로 판별하지 않는다.
class ExpiredSessionError extends Error {
  constructor() {
    super('학습 연결이 만료됐어요. 다시 연결해 주세요.');
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertSessionDecision(data) {
  if (!isObject(data)) throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
  const fields = {
    REVIEW: 'review_batch',
    NEW_GRAMMAR: 'node_id',
    INTERLEAVING: 'node_sequence',
    CONVERSATION: null,
    IDLE: null,
  };
  if (!Object.hasOwn(fields, data.next_action)) {
    throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
  }
  const field = fields[data.next_action];
  const expected = field ? ['next_action', field] : ['next_action'];
  if (Object.keys(data).length !== expected.length || !expected.every((key) => Object.hasOwn(data, key))) {
    throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
  }
  if (data.next_action === 'NEW_GRAMMAR' && (typeof data.node_id !== 'string' || !data.node_id.trim())) {
    throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
  }
  if (data.next_action === 'REVIEW' && (
    !Array.isArray(data.review_batch) ||
    data.review_batch.some((item) => !isObject(item) || typeof item.node_id !== 'string' || !item.node_id.trim())
  )) throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
  if (data.next_action === 'INTERLEAVING' && (
    !Array.isArray(data.node_sequence) ||
    data.node_sequence.some((id) => typeof id !== 'string' || !id.trim())
  )) throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
  return data;
}

// 인증 발급·저장과 학습 정책을 맡지 않는 HTTP 경계다.
class HttpLearningFlowTransport {
  constructor({ getAccessToken, fetchImpl = globalThis.fetch, baseUrl = '', timeoutMs = 10000 }) {
    if (typeof getAccessToken !== 'function' || typeof fetchImpl !== 'function') {
      throw new TypeError('getAccessToken과 fetchImpl 함수가 필요합니다');
    }
    if (typeof baseUrl !== 'string' || !Number.isInteger(timeoutMs) || timeoutMs <= 0) {
      throw new TypeError('올바른 baseUrl과 timeoutMs가 필요합니다');
    }
    if (baseUrl) {
      const url = new URL(baseUrl);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new TypeError('baseUrl에는 HTTP 주소만 사용할 수 있습니다');
      }
    }
    this.getAccessToken = getAccessToken;
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  async startSession(_userId, language, conversationBoundaryAcknowledged) {
    const body = { language };
    if (conversationBoundaryAcknowledged !== undefined) {
      body.conversation_boundary_acknowledged = conversationBoundaryAcknowledged;
    }
    return assertSessionDecision(await this.#post('/flow/start-session', body));
  }

  async startExplicitStudy(_userId, nodeId) {
    return assertExplicitStudyResult(await this.#post('/flow/start-explicit-study', { node_id: nodeId }), nodeId);
  }

  async #post(path, body) {
    // user_id는 요청 바디에 넣지 않는다. 서버가 토큰으로 식별한다.
    const token = await this.getAccessToken();
    if (typeof token !== 'string' || !token || /[\x00-\x20\x7f]/.test(token)) {
      throw new Error('학습 연결을 준비하고 있어요. 연결 후 다시 시작해 주세요.');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(this.baseUrl + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
      });
      let envelope;
      try {
        envelope = await response.json();
      } catch {
        throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
      }
      if (response.status === 401) throw new ExpiredSessionError();
      if (isObject(envelope) && envelope.status === 'error' && Object.hasOwn(PUBLIC_ERRORS, envelope.error_code)) {
        const error = new Error(PUBLIC_ERRORS[envelope.error_code]);
        error.code = envelope.error_code;
        // 기존 in-process 경계와 동일한, 검증된 capacity 오류만 재조회한다.
        if (path === '/flow/start-explicit-study' && error.code === 'CONTRACT_VIOLATION' &&
            typeof envelope.message === 'string' && envelope.message.startsWith(CAPACITY_REJECTION_PREFIX)) {
          throw new CapacityAdmissionConflictError(error);
        }
        throw error;
      }
      if (!response.ok || !isObject(envelope) || envelope.status !== 'ok' || !isObject(envelope.data)) {
        throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
      }
      return envelope.data;
    } catch (error) {
      if (error instanceof CapacityAdmissionConflictError || Object.hasOwn(PUBLIC_ERRORS, error?.code)) throw error;
      if (controller.signal.aborted) throw new Error('응답이 늦어지고 있어요. 연결을 확인한 뒤 다시 시도해 주세요.');
      if (error instanceof ExpiredSessionError) throw error;
      // fetch 예외·서버 원문·토큰·DB 진단을 화면에 전달하지 않는다.
      throw new Error('학습 연결을 확인한 뒤 다시 시도해 주세요.');
    } finally {
      clearTimeout(timer);
    }
  }
}

module.exports = { HttpLearningFlowTransport };
