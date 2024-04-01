import { getLogger } from '../../logger';

export type LoopFn = () => Promise<void> | void;

export class Loop {
  private running: Promise<void> | undefined;
  private log = getLogger();
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
      this.log.warn({ id, message: 'loop already started' });
      return;
    }

    this.started = true;
    this.log.info({ id, message: 'loop started' });

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
    this.log.info({ id: this.id, message: 'loop stopped' });
    await this.running;
  }

  async tick() {
    this.log.debug({ id: this.id, message: 'loop tick' });
    await this.fn();
  }
}
