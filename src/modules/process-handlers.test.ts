import { createSandbox } from 'sinon';
import { loadModules } from '../modules';
import { config } from './config';
import * as shutdown from './shutdown';
import type { CoreServiceRegistry } from '../types';

describe('modules/process-handlers', () => {
  const app = {} as CoreServiceRegistry;
  const sandbox = createSandbox();

  beforeEach(async () => {
    await loadModules(app, `${__dirname}/process-handlers.ts`);
  });

  afterEach(async () => {
    sandbox.restore();
    await shutdown.run(() => {});
  });

  it('logs an error on uncaughtException and exits', (done) => {
    sandbox.stub(shutdown, 'run').callsFake(async () => done());

    new Promise((_, reject) =>
      setImmediate(() => reject(new Error('Test error'))),
    );
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
