import { strictEqual } from 'node:assert';
import type { CoreServiceRegistry } from '..';
import { loadModules } from '../modules';

describe('modules/timing', () => {
  const sr = {} as CoreServiceRegistry;

  beforeAll(async () => {
    await loadModules(sr, `${__dirname}/timing.ts`);
  });

  it('makeTimer returns function that returns diff in milliseconds', () => {
    const t1 = Date.now();
    const t2 = t1 + 10;

    vi.spyOn(Date, 'now').mockReturnValueOnce(t1).mockReturnValueOnce(t2);

    strictEqual(sr.core.timing.makeTimer()(), 10);
  });

  it('makeTimer returns function that returns diff in milliseconds', () => {
    const t1 = process.hrtime.bigint();
    const t2 = t1 + 100n;

    vi.spyOn(process.hrtime, 'bigint')
      .mockReturnValueOnce(t1)
      .mockReturnValueOnce(t2);

    strictEqual(sr.core.timing.makeTimerNs()(), 100);
  });
});
