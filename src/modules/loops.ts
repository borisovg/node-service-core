import { getLogger } from '../logger';

type LoopFn = () => Promise<void> | void;

const log = getLogger();
const loopStore: Map<string, Loop> = new Map();

export function addLoop(id: string, interval: number, fn: LoopFn) {
  if (loopStore.has(id)) {
    throw new Error(`Duplicate loop ID: ${id}`);
  }

  const loop = new Loop(id, interval, fn);

  loopStore.set(id, loop);
  return loop;
}

export function getLoop(id: string) {
  return loopStore.get(id);
}

export async function removeLoop(id: string) {
  const loop = loopStore.get(id);

  if (loop) {
    loopStore.delete(loop.id);
    return loop.stop();
  } else {
    log.warn({ id, message: 'loop not found when removing' });
  }
}

export function $onShutdown() {
  return Promise.all(Array.from(loopStore.keys()).map(removeLoop));
}

class Loop {
  private running: Promise<void> | undefined;
  private started = false;
  private timer: NodeJS.Timeout | undefined;

  constructor(
    readonly id: string,
    private interval: number,
    private fn: LoopFn,
  ) {
    this.start();
  }

  start() {
    const { id } = this;

    if (this.started) {
      log.warn({ id, message: 'loop already started' });
      return;
    }

    this.started = true;
    log.info({ id, message: 'loop started' });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    (function loop() {
      that.running = that.tick().then(() => {
        that.running = undefined;

        if (that.started) {
          that.timer = setTimeout(loop, that.interval);
        }
      });
    })();
  }

  async stop() {
    this.started = false;
    clearTimeout(this.timer);
    log.info({ id: this.id, message: 'loop stopped' });
    await this.running;
  }

  async tick() {
    log.debug({ id: this.id, message: 'loop tick' });
    await this.fn();
  }
}
