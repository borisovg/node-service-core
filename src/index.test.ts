import { strictEqual } from 'assert';
import * as core from '.';

describe('index', () => {
  after((done) => {
    core.shutdown.run(done);
  });

  it('exports logger functions', () => {
    strictEqual(typeof core.getLogger, 'function');
    strictEqual(typeof core.setLogger, 'function');
  });

  it('exports "getName" function from module loader', () => {
    strictEqual(typeof core.getName, 'function');
  });

  it('exports module loader functions', () => {
    strictEqual(typeof core.load, 'function');
    strictEqual(typeof core.loadModules, 'function');
  });

  it('exports shutdown functions', () => {
    strictEqual(typeof core.shutdown.add, 'function');
    strictEqual(typeof core.shutdown.run, 'function');
  });

  it('loads modules', async () => {
    await core.load(`${__dirname}/logger.ts`);
    await core.load();
  });
});
