import { strictEqual, throws } from 'assert';
import { addLoop, getLoop, loadModules, removeLoop, shutdown } from '..';

describe('modules/loops', () => {
  beforeEach(() => {
    loadModules(`${__dirname}/loops.ts`);
  });

  afterEach(async () => shutdown.run(() => {}));

  it('addLoop() adds a loop and returns loop object', (done) => {
    let i = 0;

    const loop = addLoop('test', 5, () => {
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

    addLoop('test-1', 3, () => {
      i++;
    }),
      addLoop('test-2', 4, () => {
        j++;
      }),
      addLoop('test-3', 5, () => {
        k++;
      }),
      (function loop() {
        if (i < 3 || j < 3 || k < 3) {
          return setTimeout(loop, 2);
        }

        done();
      })();
  });

  it('addLoop() throws error when adding a loop with an ID of an existing loop', () => {
    addLoop('test', 5, () => {});
    throws(() => addLoop('test', 3, () => {}), /Duplicate loop ID: test/);
  });

  it('addLoop() does not throw when removing non-existent loop', () => {
    removeLoop('foo');
  });

  it('does not throw when starting an already started loop', () => {
    const loop = addLoop('test', 5, () => {});
    loop.start();
  });

  it('exposes a method to stop and manually tick the loop', (done) => {
    let i = 0;
    const loop = addLoop('test', 1, () => {
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

  it('getLoop() returns a loop if it exists', () => {
    addLoop('test', 5, () => {});
    strictEqual(getLoop('test')?.id, 'test');
    strictEqual(getLoop('foo'), undefined);
  });
});
