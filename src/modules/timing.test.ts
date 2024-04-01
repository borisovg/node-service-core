import { strictEqual } from 'node:assert';
import { createSandbox } from 'sinon';
import { type CoreServiceRegistry } from '..';
import { loadModules } from '../modules';

describe('modules/timing', () => {
  const sr = {} as CoreServiceRegistry;
  const sandbox = createSandbox();

  before(async () => {
    await loadModules(sr, `${__dirname}/timing.ts`);
  });

  it('makeTimer returns function that returns diff in milliseconds', () => {
    const t1 = Date.now();
    const t2 = t1 + 10;

    sandbox
      .stub(Date, 'now')
      .onFirstCall()
      .returns(t1)
      .onSecondCall()
      .returns(t2);

    strictEqual(sr.core.timing.makeTimer()(), 10);
  });

  it('makeTimer returns function that returns diff in milliseconds', () => {
    const t1 = process.hrtime.bigint();
    const t2 = t1 + 100n;

    sandbox
      .stub(process.hrtime, 'bigint')
      .onFirstCall()
      .returns(t1)
      .onSecondCall()
      .returns(t2);

    strictEqual(sr.core.timing.makeTimerNs()(), 100);
  });
});
