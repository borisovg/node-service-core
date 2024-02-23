import type { CoreServiceRegistry } from '../types';

export function $onBind(app: CoreServiceRegistry) {
  app.core = app.core || {};
  app.core.config = config;
}

export const config = {
  shutdown: {
    shutdownDelay: 100,
    shutdownTimeout: 10000,
  },
};
