import { config } from './config';
import { getLogger } from '../logger';
import type { CoreServiceRegistry } from '../types';

type ShutdownActionFn = () => Promise<void> | void;

export function $onBind(sr: CoreServiceRegistry) {
  sr.core = sr.core || {};
  sr.core.shutdown = { add, run };
}

const actions: Map<string, ShutdownActionFn> = new Map();
const log = getLogger();

export function add(id: string, fn: ShutdownActionFn) {
  if (actions.has(id)) {
    throw new Error(`Duplicate shutdown action ID: ${id}`);
  }

  actions.set(id, fn);
  log.trace({ id, message: 'added shutdown task' });
}

export async function run(done?: () => void) {
  const promises = [];

  for (const [id, fn] of actions) {
    promises.push(runAction(id, fn));
  }

  await Promise.all(promises);

  if (done) {
    return done();
  }

  log.info({ message: 'exiting' });
  setTimeout(() => process.exit(), config.shutdown.shutdownDelay);
}

async function runAction(id: string, fn: ShutdownActionFn) {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      log.warn({ id, message: 'timeout running shutdown action' });
      resolve();
    }, config.shutdown.shutdownTimeout);

    log.trace({ id, message: 'running shutdown action' });

    Promise.resolve(fn())
      .catch((error) => {
        log.warn({
          error,
          id,
          message: 'error running shutdown action',
        });
      })
      .finally(() => {
        clearTimeout(timeout);
        actions.delete(id);
        resolve();
      });
  });
}
