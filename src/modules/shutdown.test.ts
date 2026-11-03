import { deepStrictEqual, throws } from 'node:assert';
import type { CoreServiceRegistry } from '..';
import { loadModules } from '../modules';
import { config } from './config';

describe('modules/shutdown', () => {
  const sr = {} as CoreServiceRegistry;

  beforeAll(async () => {
    await loadModules(sr, `${__dirname}/shutdown.ts`);
  });

  afterEach(async () => {
    await sr.core.shutdown.run(() => {});
    vi.restoreAllMocks();
  });

  it('throws an error on duplicate ID', () => {
    const fn = () => Promise.resolve();

    sr.core.shutdown.add('TEST', fn);

    throws(() => sr.core.shutdown.add('TEST', fn), {
      message: 'Duplicate shutdown action ID: TEST',
    });
  });

  it('timeout for tasks', () =>
    new Promise<void>((done) => {
      vi.spyOn(config.shutdown, 'shutdownTimeout', 'get').mockReturnValue(10);

      sr.core.shutdown.add(
        'TEST',
        () => new Promise((resolve) => setTimeout(resolve, 20)),
      );

      sr.core.shutdown.run(done);
    }));

  it('logs a message if action fails and continues', () =>
    new Promise<void>((done) => {
      const results: number[] = [];

      sr.core.shutdown.add(
        'TEST-1',
        () =>
          new Promise((_, reject) => {
            results.push(1);
            reject(new Error('Test Error'));
          }),
      );

      sr.core.shutdown.add(
        'TEST-2',
        () =>
          new Promise((resolve) => {
            results.push(2);
            resolve();
          }),
      );

      sr.core.shutdown.run(() => {
        deepStrictEqual(results, [1, 2]);
        done();
      });
    }));

  it('exits the process if no callback is passed', () =>
    new Promise<void>((done) => {
      vi.spyOn(config.shutdown, 'shutdownDelay', 'get').mockReturnValue(10);

      vi.spyOn(process, 'exit').mockImplementation((() =>
        done()) as typeof process.exit);

      sr.core.shutdown.run();
    }));
});
