import { getLogger } from './logger';

type ActionFn = () => Promise<void>;

const log = getLogger();
const actions: Map<string, ActionFn> = new Map();

export const config = {
  shutdownDelay: 100,
  shutdownTimeout: 10000,
};

export function add(id: string, fn: ActionFn) {
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
  setTimeout(() => process.exit(), config.shutdownDelay);
}

async function runAction(id: string, fn: ActionFn) {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      log.warn({ id, message: 'timeout running shutdown action' });
      resolve();
    }, config.shutdownTimeout);

    log.trace({ id, message: 'running shutdown action' });

    Promise.resolve(fn())
      .catch((error) => {
        log.warn({ error, id, message: 'error running shutdown action' });
      })
      .finally(() => {
        clearTimeout(timeout);
        actions.delete(id);
        resolve();
      });
  });
}
