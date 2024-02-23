import { strictEqual } from 'assert';
import * as core from '.';

describe('index', () => {
  after((done) => {
    core.shutdown(done);
  });

  it('exports config object', () => {
    strictEqual(typeof core.config.shutdown.shutdownDelay, 'number');
    strictEqual(typeof core.config.shutdown.shutdownTimeout, 'number');
  });

  it('exports logger functions', () => {
    strictEqual(typeof core.getLogger, 'function');
    strictEqual(typeof core.setLogger, 'function');
  });

  it('exports "getName" function from module loader', () => {
    strictEqual(typeof core.getName, 'function');
  });

  it('exports module loader function', () => {
    strictEqual(typeof core.load, 'function');
  });

  it('exports shutdown function', () => {
    strictEqual(typeof core.shutdown, 'function');
  });

  it('loads modules', async () => {
    const app = {} as core.CoreServiceRegistry;
    await core.load(`${__dirname}/logger.ts`);
    await core.load([`${__dirname}/logger.ts`]);
    await core.load(undefined, app);

    strictEqual(typeof app.core.config.shutdown.shutdownDelay, 'number');
    strictEqual(typeof app.core.config.shutdown.shutdownTimeout, 'number');
    strictEqual(typeof app.core.loops.add, 'function');
    strictEqual(typeof app.core.loops.get, 'function');
    strictEqual(typeof app.core.loops.remove, 'function');
    strictEqual(typeof app.core.loops.removeAll, 'function');
    strictEqual(typeof app.core.shutdown.add, 'function');
    strictEqual(typeof app.core.shutdown.run, 'function');
    strictEqual(typeof app.core.timing.makeTimer, 'function');
    strictEqual(typeof app.core.timing.makeTimerNs, 'function');
  });
});
