import { strictEqual } from 'assert';
import * as core from '.';

describe('index', () => {
  afterEach(() => core.shutdown());

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
    const sr = {} as core.CoreServiceRegistry;
    const sr2 = await core.load(undefined, sr);

    strictEqual(sr, sr2);
    strictEqual(typeof sr.core.config.shutdown.shutdownDelay, 'number');
    strictEqual(typeof sr.core.config.shutdown.shutdownTimeout, 'number');
    strictEqual(typeof sr.core.loops.add, 'function');
    strictEqual(typeof sr.core.loops.get, 'function');
    strictEqual(typeof sr.core.loops.remove, 'function');
    strictEqual(typeof sr.core.loops.removeAll, 'function');
    strictEqual(typeof sr.core.shutdown.add, 'function');
    strictEqual(typeof sr.core.shutdown.run, 'function');
    strictEqual(typeof sr.core.timing.makeTimer, 'function');
    strictEqual(typeof sr.core.timing.makeTimerNs, 'function');
  });

  it('loads core and extra modules from string path', async () => {
    const sr = await core.load(`${__dirname}/logger.ts`);
    strictEqual(typeof sr.core.config, 'object');
  });

  it('loads core and extra modules from list of paths', async () => {
    const sr = await core.load([`${__dirname}/logger.ts`]);
    strictEqual(typeof sr.core.config, 'object');
  });

  it('skips empty string in path list', async () => {
    const sr = await core.load(['']);
    strictEqual(typeof sr.core.config, 'object');
  });
});
