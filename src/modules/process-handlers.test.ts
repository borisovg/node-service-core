import { createSandbox } from 'sinon';
import { loadModules } from '../modules';
import { config } from './config';
import * as shutdown from './shutdown';
import type { CoreServiceRegistry } from '../types';
import { strictEqual } from 'assert';

describe('modules/process-handlers', () => {
  const sr = {} as CoreServiceRegistry;
  const sandbox = createSandbox();

  beforeEach(async () => {
    await loadModules(sr, `${__dirname}/process-handlers.ts`);
  });

  afterEach(async () => {
    sandbox.restore();
    await shutdown.run(() => {});
  });

  it('logs an error on uncaughtException and exits', (done) => {
    const spy = sandbox.stub(process, 'exit');

    new Promise((_, reject) =>
      setImmediate(() => reject(new Error('Test error'))),
    );

    const timer = setInterval(() => {
      if (!spy.callCount) return;
      clearInterval(timer);
      strictEqual(spy.firstCall.args[0], 1);
      done();
    });
  });

  it('handles SIGINT events', (done) => {
    sandbox.stub(shutdown, 'run').callsFake(async () => done());
    process.emit('SIGINT');
  });

  it('handles SIGTERM events', (done) => {
    sandbox.replace(config.shutdown, 'shutdownDelay', 10);

    sandbox
      .stub(process, 'exit')
      .callsFake((() => done()) as typeof process.exit);
    process.emit('SIGTERM');
  });
});
