const path = require('node:path');
const { createLearningFlowHttpServer } = require('../src/server/learningFlowHttpServer');

// This module is trusted host code, supplied by the operator, never by an HTTP request.
function loadHostConfiguration(modulePath) {
  if (modulePath === undefined || modulePath === '') return {};
  if (typeof modulePath !== 'string') throw new TypeError('host module path must be a string');
  const config = require(path.resolve(modulePath));
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('host module must export a configuration object');
  }
  return config;
}

async function startLearningApi({ port = 4174, hostModulePath, output = process.stdout } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new TypeError('invalid API port');
  const config = loadHostConfiguration(hostModulePath);
  if (config.onClose !== undefined && typeof config.onClose !== 'function') throw new TypeError('onClose must be a function');
  const server = createLearningFlowHttpServer({
    transport: config.transport,
    resolveUserId: config.resolveUserId,
    createGuest: config.createGuest,
  });
  if (config.onClose) server.once('close', () => {
    Promise.resolve().then(() => config.onClose()).catch(() => {
      process.stderr.write('학습 API 연결을 종료할 수 없습니다. 실행 설정을 확인해 주세요.\n');
      process.exitCode = 1;
    });
  });
  await new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    server.once('error', onError);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', onError);
      resolve();
    });
  });
  output.write(`LLE 학습 API: http://127.0.0.1:${server.address().port}\n`);
  if (!config.transport || !config.resolveUserId) {
    output.write('인증/학습 전송 미연결: 학습 요청은 503으로 응답합니다.\n');
  }
  if (config.createGuest) output.write('게스트 발급 경로 연결: POST /auth/guest\n');
  return server;
}

if (require.main === module) {
  startLearningApi({
    port: process.env.LLE_API_PORT === undefined ? 4174 : Number(process.env.LLE_API_PORT),
    hostModulePath: process.env.LLE_API_HOST_MODULE,
  }).then((server) => {
    const shutdown = () => { server.close(); server.closeIdleConnections(); };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    server.once('close', () => {
      process.removeListener('SIGINT', shutdown);
      process.removeListener('SIGTERM', shutdown);
    });
    server.on('error', () => {
      process.stderr.write('학습 API 서버 오류: 실행 설정을 확인해 주세요.\n');
      shutdown();
      process.exitCode = 1;
    });
  }).catch(() => {
    process.stderr.write('학습 API 서버를 시작할 수 없습니다. 실행 설정을 확인해 주세요.\n');
    process.exitCode = 1;
  });
}

module.exports = { loadHostConfiguration, startLearningApi };
