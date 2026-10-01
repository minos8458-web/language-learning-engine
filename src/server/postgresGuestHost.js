const { createGuestAuthService } = require('./guestAuthService');
const { InProcessLearningFlowTransport } = require('../transport/inProcessLearningFlowTransport');

function createPostgresGuestHost(options) {
  const auth = createGuestAuthService(options);
  return {
    ...auth,
    transport: new InProcessLearningFlowTransport(options.pool),
    onClose: async () => { if (typeof options.pool.end === 'function') await options.pool.end(); },
  };
}

module.exports = { createPostgresGuestHost };
