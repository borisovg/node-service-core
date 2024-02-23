import { deepStrictEqual, throws } from 'node:assert';
import { createSandbox } from 'sinon';
import { config } from './config';
import { loadModules } from '../modules';
import { type CoreServiceRegistry } from '..';

describe('modules/shutdown', () => {
  const app = {} as CoreServiceRegistry;
  const sandbox = createSandbox();

  before(async () => {
    await loadModules(app, `${__dirname}/shutdown.ts`);
  });

  afterEach(async () => {
    await app.core.shutdown.run(() => {});
    sandbox.restore();
  });

  it('throws an error on duplicate ID', () => {
    const fn = () => Promise.resolve();

    app.core.shutdown.add('TEST', fn);

    throws(() => app.core.shutdown.add('TEST', fn), {
      message: 'Duplicate shutdown action ID: TEST',
    });
  });

  it('timeout for tasks', (done) => {
    sandbox.replace(config.shutdown, 'shutdownTimeout', 10);

    app.core.shutdown.add(
      'TEST',
      () => new Promise((resolve) => setTimeout(resolve, 20)),
    );

    app.core.shutdown.run(done);
  });

  it('logs a message if action failes and continues', (done) => {
    const results: number[] = [];

    app.core.shutdown.add(
      'TEST-1',
      () =>
        new Promise((_, reject) => {
          results.push(1);
          reject(new Error('Test Error'));
        }),
    );

    app.core.shutdown.add(
      'TEST-2',
      () =>
        new Promise((resolve) => {
          results.push(2);
          resolve();
        }),
    );

    app.core.shutdown.run(() => {
      deepStrictEqual(results, [1, 2]);
      done();
    });
  });

  it('exits the process if no callback is passed', (done) => {
    sandbox.replace(config.shutdown, 'shutdownDelay', 10);

    sandbox
      .stub(process, 'exit')
      .callsFake((() => done()) as typeof process.exit);

    app.core.shutdown.run();
  });
});
