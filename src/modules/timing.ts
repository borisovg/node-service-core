import type { CoreServiceRegistry } from '../types';

export function $onBind(app: CoreServiceRegistry) {
  app.core = app.core || {};
  app.core.timing = { makeTimer, makeTimerNs };
}

/**
 * @returns A function that returns elapsed time in milliseconds.
 */
export function makeTimer() {
  const start = Date.now();
  return () => Date.now() - start;
}

/**
 * @returns A function that returns elapsed time in nanoseconds.
 */
export function makeTimerNs() {
  const start = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - start);
}
