import type { CoreServiceRegistry } from '../types';

export function $onBind(sr: CoreServiceRegistry) {
  sr.core = sr.core || {};
  sr.core.config = config;
}

export const config = {
  shutdown: {
    shutdownDelay: 100,
    shutdownTimeout: 10000,
  },
};
