'use strict';

// tests/incidentRecoveryCalibrationHarness.js
//
// B-3 M1 — Current-Path Incident-Recovery Mechanics Characterization &
// Integrity-Under-Fault Validation.
//
// Harness-only fault-injection, timing, and evidence-package utilities used
// exclusively by tests/incidentRecoveryCalibration.test.js.
//
// Scope discipline (binding):
//   - This file contains NO production code and modifies NO production file.
//     It wraps/proxies the existing db/pool.js pool and calls the existing
//     evidenceRepository functions from outside, using only interfaces those
//     modules already expose (pool.query / pool.connect / client.query /
//     client.release, the same shape node-postgres already provides).
//   - All retry/backoff parameters accepted below are HARNESS-OWNED
//     EXPERIMENTAL INPUTS for this calibration run. A value used here is a
//     recovery characterization measurement input, never a discovered,
//     validated, or recommended owner RETRY_COUNT / RECOVERY_WINDOW policy.
//     Those remain OWNER_VALUE_UNSET / OWNER JUDGMENT STILL REQUIRED
//     regardless of any value exercised by this harness.
//   - recovery_attempt_ordinal produced below describes only the synthetic
//     scenario executed in a given test run; it is never evidence that a
//     real owner RETRY_COUNT should equal that ordinal, and repeatability
//     observed across two harness executions is observed repeatability for
//     those executions only — not proof of harness determinism, absence of
//     nondeterminism, real-world recovery-time distribution, or owner-policy
//     adequacy.

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Client } = require('pg');

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

function nowMs() {
  return Date.now();
}

function isoNow() {
  return new Date().toISOString();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Asserts every (name, value) pair in `sequence` is non-negative and
// non-decreasing relative to the previous entry — i.e. CAUSAL ORDERING only.
// Ordinary OS/PostgreSQL latency jitter (unequal gaps) is expected and is
// never itself a failure; this only rejects an impossible ordering (a later
// declared event timestamped before an earlier one) or a negative duration.
function assertCausalOrder(sequence) {
  let previous = null;
  for (const entry of sequence) {
    if (typeof entry.value !== 'number' || Number.isNaN(entry.value)) {
      throw new Error(`timing field ${entry.name} is not a finite number`);
    }
    if (entry.value < 0) {
      throw new Error(`timing field ${entry.name} is negative (${entry.value})`);
    }
    if (previous && entry.value < previous.value) {
      throw new Error(
        `timing field ${entry.name} (${entry.value}) precedes ${previous.name} (${previous.value})`
      );
    }
    previous = entry;
  }
}

// ---------------------------------------------------------------------------
// Ephemeral evidence-package sink.
//
// Output: stdout JSONL (console.log, one episode per line, prefixed so it is
// greppable) AND a Windows-TEMP JSONL file (os.tmpdir()). Never written to
// PostgreSQL. Never committed — the file lives outside the repository tree.
// ---------------------------------------------------------------------------

function createEpisodeSink() {
  const filePath = path.join(
    os.tmpdir(),
    `b3-incident-recovery-calibration-${process.pid}-${Date.now()}.jsonl`
  );
  const episodes = [];
  return {
    filePath,
    emit(episode) {
      episodes.push(episode);
      const line = JSON.stringify(episode);
      fs.appendFileSync(filePath, line + os.EOL);
      // eslint-disable-next-line no-console
      console.log(`[B3-M1-EPISODE] ${line}`);
      return episode;
    },
    all() {
      return episodes.slice();
    },
  };
}

// ---------------------------------------------------------------------------
// Fault injection.
//
// createFaultCounter(N) + wrapPoolWithFaults(...) implement a harness-owned
// forced error: queries matching `matcher` fail for the first N matching
// calls observed through the wrapped pool/client, then pass through
// unchanged. Because the counter is shared across every connect()/query()
// call made through one wrapper instance, a harness-owned retry loop that
// re-invokes the SAME repository operation against the SAME wrapper observes
// the fault clearing after exactly N injected failures — modeling a
// transient fault that recovers on its own within a bounded number of
// attempts, without any production retry/backoff code.
// ---------------------------------------------------------------------------

function createFaultCounter(failCount) {
  let remaining = failCount;
  const attempts = [];
  return {
    get remaining() {
      return remaining;
    },
    // Returns true (and decrements) iff this call should be injected as a
    // failure. Records every observation (fault and pass-through alike) for
    // diagnostic disclosure.
    consume(sql) {
      const shouldFail = remaining > 0;
      if (shouldFail) remaining -= 1;
      attempts.push({
        sql,
        injectedFailure: shouldFail,
        at: isoNow(),
        atMs: nowMs(),
        remainingAfter: remaining,
      });
      return shouldFail;
    },
    attempts,
  };
}

function defaultInjectedError() {
  const error = new Error('harness-injected transient DB failure (test-controlled, non-production)');
  error.code = 'HARNESS_INJECTED_TRANSIENT_FAILURE';
  return error;
}

// Wraps an existing queryable pool (db/pool.js's `pool`, or any object with
// the same node-postgres .query()/.connect() shape) so that statements
// matching `matcher` fail while `counter` has injections remaining, then
// pass through to the real `basePool` unchanged. This is a wrapper/proxy
// around an existing queryable dependency — no production file is read,
// written, or modified to build it.
function wrapPoolWithFaults(basePool, { matcher, counter, errorFactory }) {
  const makeError = errorFactory || defaultInjectedError;
  return {
    async query(...args) {
      const sql = typeof args[0] === 'string' ? args[0] : args[0]?.text;
      if (matcher.test(String(sql)) && counter.consume(String(sql))) {
        throw makeError();
      }
      return basePool.query(...args);
    },
    async connect() {
      const client = await basePool.connect();
      return {
        async query(...args) {
          const sql = typeof args[0] === 'string' ? args[0] : args[0]?.text;
          if (matcher.test(String(sql)) && counter.consume(String(sql))) {
            throw makeError();
          }
          return client.query(...args);
        },
        release(...args) {
          return client.release(...args);
        },
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Harness-owned recovery loop.
//
// BINDING: maxAttempts / spacingMs / cadenceMode below are EXPERIMENTAL
// INPUTS to this calibration run. This function characterizes how the
// current path behaves when something outside it retries with these
// declared parameters against actual PostgreSQL — it does not select,
// bound, or recommend any owner retry policy.
// ---------------------------------------------------------------------------

async function runWithHarnessRecovery({
  operation,
  maxAttempts,
  spacingMs,
  cadenceMode = 'FIXED',
}) {
  const trace = [];
  let lastError = null;
  for (let ordinal = 1; ordinal <= maxAttempts; ordinal += 1) {
    const attemptAt = isoNow();
    const attemptAtMs = nowMs();
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await operation(ordinal);
      trace.push({
        recovery_attempt_ordinal: ordinal,
        recovery_attempt_at: attemptAt,
        recovery_attempt_at_ms: attemptAtMs,
        recovery_succeeded: true,
        fault_recoverability_state: 'RECOVERED',
        error_class: null,
      });
      return { result, trace, succeededOnOrdinal: ordinal };
    } catch (error) {
      lastError = error;
      trace.push({
        recovery_attempt_ordinal: ordinal,
        recovery_attempt_at: attemptAt,
        recovery_attempt_at_ms: attemptAtMs,
        recovery_succeeded: false,
        fault_recoverability_state: ordinal < maxAttempts ? 'STILL_FAULTED' : 'EXHAUSTED',
        error_class: error?.code || error?.constructor?.name || 'Error',
      });
      if (ordinal < maxAttempts) {
        const spacing = cadenceMode === 'EXPONENTIAL'
          ? spacingMs * (2 ** (ordinal - 1))
          : spacingMs;
        // eslint-disable-next-line no-await-in-loop
        await sleep(spacing);
      }
    }
  }
  const error = new Error('harness recovery loop exhausted declared maxAttempts (experimental input)');
  error.cause = lastError;
  error.trace = trace;
  throw error;
}

// ---------------------------------------------------------------------------
// FAMILY 3 — isolated harness-owned PostgreSQL connection/backend
// termination + reconnection.
//
// Never stops the Windows PostgreSQL service, never modifies pg_hba.conf or
// credentials, and never terminates any backend other than the one this
// harness itself opened via openIsolatedClient() below.
// ---------------------------------------------------------------------------

// node-postgres Clients emit an EventEmitter 'error' event when the
// underlying connection is dropped out from under them (e.g. this file's
// own pg_terminate_backend below). Without a listener that is an unhandled
// 'error' event, which Node treats as an uncaught exception. This harness
// intentionally terminates its own isolated connections, so every isolated
// Client it creates gets a swallow listener — the resulting rejection is
// still observed and recorded through the normal await/catch path in
// runWithHarnessRecovery.
function attachErrorSwallow(client) {
  client.on('error', () => {});
  return client;
}

async function openIsolatedClient() {
  const client = attachErrorSwallow(new Client());
  await client.connect();
  const { rows } = await client.query('SELECT pg_backend_pid() AS pid');
  return { client, pid: rows[0].pid };
}

function newIsolatedClient() {
  return attachErrorSwallow(new Client());
}

// Terminates ONLY the specific backend pid the harness itself opened.
// `controlQueryable` is a separate, already-open connection (the shared
// db/pool.js pool is an acceptable control connection here because the
// target is scoped to one harness-owned pid — no unrelated session is
// touched).
async function terminateIsolatedBackend(controlQueryable, pid) {
  const { rows } = await controlQueryable.query(
    'SELECT pg_terminate_backend($1) AS terminated',
    [pid]
  );
  return rows[0].terminated === true;
}

function randomSuffix() {
  return crypto.randomBytes(6).toString('hex');
}

module.exports = {
  nowMs,
  isoNow,
  sleep,
  assertCausalOrder,
  createEpisodeSink,
  createFaultCounter,
  wrapPoolWithFaults,
  defaultInjectedError,
  runWithHarnessRecovery,
  openIsolatedClient,
  newIsolatedClient,
  terminateIsolatedBackend,
  randomSuffix,
};
