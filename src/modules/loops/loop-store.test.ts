import { strictEqual, throws } from 'assert';
import { shutdown, type CoreServiceRegistry } from '../..';
import { loadModules } from '../../modules';

describe('modules/loops/loop-store', () => {
  const sr = {} as CoreServiceRegistry;

  beforeEach(async () => {
    await loadModules(sr, `${__dirname}/loop-store.ts`);
  });

  afterEach(async () => shutdown(() => {}));

  it('adds a loop and returns loop object', (done) => {
    let i = 0;

    const loop = sr.core.loops.add('test', 5, () => {
      if (i++ === 3) {
        done();
      }
    });

    strictEqual(loop.id, 'test');
  });

  it('runs multiple loops concurrently', (done) => {
    let i = 0;
    let j = 0;
    let k = 0;

    sr.core.loops.add('test-1', 3, () => {
      i++;
    }),
      sr.core.loops.add('test-2', 4, () => {
        j++;
      }),
      sr.core.loops.add('test-3', 5, () => {
        k++;
      }),
      (function loop() {
        if (i < 3 || j < 3 || k < 3) {
          setTimeout(loop, 2);
          return;
        }

        done();
      })();
  });

  it('throws error when adding a loop with an ID of an existing loop', () => {
    sr.core.loops.add('test', 5, () => {});
    throws(
      () => sr.core.loops.add('test', 3, () => {}),
      /Duplicate loop ID: test/,
    );
  });

  it('does not throw when removing non-existent loop', () => {
    sr.core.loops.remove('foo');
  });

  it('does not throw when starting an already started loop', () => {
    const loop = sr.core.loops.add('test', 5, () => {});
    loop.start();
  });

  it('exposes a method to stop and manually tick the loop', (done) => {
    let i = 0;
    const loop = sr.core.loops.add('test', 1, () => {
      i++;
    });

    loop.stop();
    i = 0;

    setTimeout(() => {
      strictEqual(i, 0);
      loop.tick();
      loop.tick();
      strictEqual(i, 2);

      setTimeout(() => {
        strictEqual(i, 2);
        done();
      }, 5);
    }, 5);
  });

  it('returns a loop if it exists', () => {
    sr.core.loops.add('test', 5, () => {});
    strictEqual(sr.core.loops.get('test')?.id, 'test');
    strictEqual(sr.core.loops.get('foo'), undefined);
  });
});
