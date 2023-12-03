import { deepStrictEqual, throws } from 'node:assert';
import { createSandbox } from 'sinon';
import { shutdown } from '.';

describe('shutdown', () => {
  const sandbox = createSandbox();

  afterEach(async () => {
    await shutdown.run(() => {});
    sandbox.restore();
  });

  it('throws an error on duplicate ID', () => {
    const fn = () => Promise.resolve();

    shutdown.add('TEST', fn);

    throws(() => shutdown.add('TEST', fn), {
      message: 'Duplicate shutdown action ID: TEST',
    });
  });

  it('timeout for tasks', (done) => {
    sandbox.replace(shutdown.config, 'shutdownTimeout', 10);

    shutdown.add(
      'TEST',
      () => new Promise((resolve) => setTimeout(resolve, 20)),
    );

    shutdown.run(done);
  });

  it('logs a message if action failes and continues', (done) => {
    const results: number[] = [];

    shutdown.add(
      'TEST-1',
      () =>
        new Promise((_, reject) => {
          results.push(1);
          reject(new Error('Test Error'));
        }),
    );

    shutdown.add(
      'TEST-2',
      () =>
        new Promise((resolve) => {
          results.push(2);
          resolve();
        }),
    );

    shutdown.run(() => {
      deepStrictEqual(results, [1, 2]);
      done();
    });
  });

  it('exits the process if no callback is passed', (done) => {
    sandbox.replace(shutdown.config, 'shutdownDelay', 10);

    sandbox
      .stub(process, 'exit')
      .callsFake((() => done()) as typeof process.exit);

    shutdown.run();
  });
});
