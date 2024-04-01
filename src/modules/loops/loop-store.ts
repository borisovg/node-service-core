import { getLogger } from '../../logger';
import { Loop, type LoopFn } from './loop';
import type { CoreServiceRegistry } from '../../types';

export function $onBind(sr: CoreServiceRegistry) {
  sr.core = sr.core || {};
  sr.core.loops = new LoopsModule();
}

export function $onShutdown(sr: CoreServiceRegistry) {
  return sr.core.loops.removeAll();
}

export class LoopsModule {
  private log = getLogger();
  private store: Map<string, Loop> = new Map();

  add(id: string, interval: number, fn: LoopFn) {
    if (this.store.has(id)) {
      throw new Error(`Duplicate loop ID: ${id}`);
    }

    const loop = new Loop(id, interval, fn);

    this.store.set(id, loop);
    return loop;
  }

  get(id: string) {
    return this.store.get(id);
  }

  remove(id: string) {
    const loop = this.store.get(id);

    if (loop) {
      this.store.delete(loop.id);
      return loop.stop();
    } else {
      this.log.warn({ id, message: 'loop not found when removing' });
    }
  }

  async removeAll() {
    await Promise.all(
      Array.from(this.store.keys()).map((id) => this.remove(id)),
    );
  }
}
