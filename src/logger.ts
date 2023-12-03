import type { Logger } from './types';

// default logger that does nothing
const defaultLogger: Partial<Logger> = {};
let logger: Partial<Logger> | undefined;

const loggerProxy: Logger = {
  debug(params) {
    const log = logger || defaultLogger;
    if (log.debug) {
      log.debug(params);
    }
  },
  error(params) {
    const log = logger || defaultLogger;
    if (log.error) {
      log.error(params);
    }
  },
  info(params) {
    const log = logger || defaultLogger;
    if (log.info) {
      log.info(params);
    }
  },
  trace(params) {
    const log = logger || defaultLogger;
    if (log.trace) {
      log.trace(params);
    }
  },
  warn(params) {
    const log = logger || defaultLogger;
    if (log.warn) {
      log.warn(params);
    }
  },
};

export function getLogger() {
  return loggerProxy;
}

export function setLogger(log?: Partial<Logger>) {
  logger = log;
}
