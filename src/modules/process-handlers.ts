import { getLogger } from '../logger';
import type { CoreServiceRegistry } from '../types';

const log = getLogger();

let handlers!: {
  error: ReturnType<typeof handleError>;
  SIGINT: ReturnType<typeof handleSIGINT>;
  SIGTERM: ReturnType<typeof handleSIGTERM>;
};

export function $onLoad(sr: CoreServiceRegistry) {
  handlers = {
    error: handleError(sr),
    SIGINT: handleSIGINT(sr),
    SIGTERM: handleSIGTERM(sr),
  };

  process.once('uncaughtException', handlers.error);
  process.once('unhandledRejection', handlers.error);

  process.once('SIGINT', handlers.SIGINT);
  process.once('SIGTERM', handlers.SIGTERM);
}

export function $onShutdown() {
  process.removeListener('uncaughtException', handlers.error);
  process.removeListener('unhandledRejection', handlers.error);

  process.removeListener('SIGINT', handlers.SIGINT);
  process.removeListener('SIGTERM', handlers.SIGTERM);
}

function handleError(sr: CoreServiceRegistry) {
  return (err: Record<string, unknown>) => {
    log.error({
      error: { code: err.code, message: err.message, stack: err.stack },
      message: 'crash',
    });
    sr.core.shutdown.run(() => process.exit(1));
  };
}

function handleSIGINT(sr: CoreServiceRegistry) {
  return () => {
    log.info({ message: 'received SIGINT' });
    sr.core.shutdown.run();
  };
}

function handleSIGTERM(sr: CoreServiceRegistry) {
  return () => {
    log.info({ message: 'received SIGTERM' });
    sr.core.shutdown.run();
  };
}
