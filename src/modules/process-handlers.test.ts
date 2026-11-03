import { strictEqual } from 'node:assert';
import { loadModules } from '../modules';
import type { CoreServiceRegistry } from '../types';
import * as shutdown from './shutdown';

describe('modules/process-handlers', () => {
  const sr = {
    core: { shutdown: { run: async () => {} } },
  } as unknown as CoreServiceRegistry;

  beforeEach(async () => {
    await loadModules(sr, `${__dirname}/process-handlers.ts`);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await shutdown.run(() => {});
  });

  it('logs an error on uncaughtException and exits', () =>
    new Promise<void>((done) => {
      const spy = vi
        .spyOn(process, 'exit')
        .mockImplementation((() => {}) as typeof process.exit);
      vi.spyOn(sr.core.shutdown, 'run').mockImplementation(async (cb) =>
        cb?.(),
      );

      new Promise((_, reject) =>
        setImmediate(() => reject(new Error('Test error'))),
      );

      const timer = setInterval(() => {
        if (!spy.mock.calls.length) return;
        clearInterval(timer);
        strictEqual(spy.mock.calls[0]?.[0], 1);
        done();
      });
    }));

  it('handles SIGINT events', () =>
    new Promise<void>((done) => {
      vi.spyOn(sr.core.shutdown, 'run').mockImplementation(async () => done());
      process.emit('SIGINT');
    }));

  it('handles SIGTERM events', () =>
    new Promise<void>((done) => {
      vi.spyOn(sr.core.shutdown, 'run').mockImplementation(async () => done());
      process.emit('SIGTERM');
    }));
});
