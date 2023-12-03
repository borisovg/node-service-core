import { deepStrictEqual, strictEqual } from 'node:assert';
import { getLogger, setLogger } from './logger';
import type { Logger } from './types';

describe('logger', () => {
  const logs: [string, Record<string, unknown>][] = [];
  const testLogger: Logger = {
    debug(params) {
      logs.push(['debug', params]);
    },
    error(params) {
      logs.push(['error', params]);
    },
    info(params) {
      logs.push(['info', params]);
    },
    trace(params) {
      logs.push(['trace', params]);
    },
    warn(params) {
      logs.push(['warn', params]);
    },
  };

  after(() => setLogger());

  afterEach(() => logs.splice(0));

  it('default logger does nothing', () => {
    const log = getLogger();

    log.debug({ message: 'debug message' });
    log.error({ message: 'error message' });
    log.info({ message: 'info message' });
    log.trace({ message: 'trace message' });
    log.warn({ message: 'warn message' });

    strictEqual(logs.length, 0);
  });

  it('uses real logger if configured', () => {
    setLogger(testLogger);

    const log = getLogger();

    log.debug({ message: 'debug message' });
    log.error({ message: 'error message' });
    log.info({ message: 'info message' });
    log.trace({ message: 'trace message' });
    log.warn({ message: 'warn message' });

    strictEqual(logs.length, 5);
    deepStrictEqual(logs[0], ['debug', { message: 'debug message' }]);
    deepStrictEqual(logs[1], ['error', { message: 'error message' }]);
    deepStrictEqual(logs[2], ['info', { message: 'info message' }]);
    deepStrictEqual(logs[3], ['trace', { message: 'trace message' }]);
    deepStrictEqual(logs[4], ['warn', { message: 'warn message' }]);
  });
});
