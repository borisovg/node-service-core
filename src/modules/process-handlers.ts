import { getLogger } from '../logger';
import * as shutdown from './shutdown';

const log = getLogger();

export function $onLoad() {
  process.once('uncaughtException', handleError);
  process.once('unhandledRejection', handleError);

  process.once('SIGINT', handleSIGINT);
  process.once('SIGTERM', handleSIGTERM);
}

export function $onShutdown() {
  process.removeListener('uncaughtException', handleError);
  process.removeListener('unhandledRejection', handleError);

  process.removeListener('SIGINT', handleSIGINT);
  process.removeListener('SIGTERM', handleSIGTERM);
}

function handleError(err: Record<string, unknown>) {
  log.error({
    error: { code: err.code, message: err.message, stack: err.stack },
    message: 'crash',
  });
  shutdown.run(() => process.exit(1));
}

function handleSIGINT() {
  log.info({ message: 'received SIGINT' });
  shutdown.run();
}

function handleSIGTERM() {
  log.info({ message: 'received SIGTERM' });
  shutdown.run();
}
