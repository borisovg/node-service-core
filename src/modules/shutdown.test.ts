import { deepStrictEqual, throws } from 'node:assert';
import { createSandbox } from 'sinon';
import { config } from './config';
import { loadModules } from '../modules';
import { type CoreServiceRegistry } from '..';

describe('modules/shutdown', () => {
  const sr = {} as CoreServiceRegistry;
  const sandbox = createSandbox();

  before(async () => {
    await loadModules(sr, `${__dirname}/shutdown.ts`);
  });

  afterEach(async () => {
    await sr.core.shutdown.run(() => {});
    sandbox.restore();
  });

  it('throws an error on duplicate ID', () => {
    const fn = () => Promise.resolve();

    sr.core.shutdown.add('TEST', fn);

    throws(() => sr.core.shutdown.add('TEST', fn), {
      message: 'Duplicate shutdown action ID: TEST',
    });
  });

  it('timeout for tasks', (done) => {
    sandbox.replace(config.shutdown, 'shutdownTimeout', 10);

    sr.core.shutdown.add(
      'TEST',
      () => new Promise((resolve) => setTimeout(resolve, 20)),
    );

    sr.core.shutdown.run(done);
  });

  it('logs a message if action fails and continues', (done) => {
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
  });

  it('exits the process if no callback is passed', (done) => {
    sandbox.replace(config.shutdown, 'shutdownDelay', 10);

    sandbox
      .stub(process, 'exit')
      .callsFake((() => done()) as typeof process.exit);

    sr.core.shutdown.run();
  });
});
