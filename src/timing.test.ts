import { strictEqual } from 'node:assert';
import { createSandbox } from 'sinon';
import { makeTimer, makeTimerNs } from '.';

describe('timing', () => {
  const sandbox = createSandbox();

  it('makeTimer returns function that returns diff in milliseconds', () => {
    const t1 = Date.now();
    const t2 = t1 + 10;

    sandbox
      .stub(Date, 'now')
      .onFirstCall()
      .returns(t1)
      .onSecondCall()
      .returns(t2);

    strictEqual(makeTimer()(), 10);
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

    strictEqual(makeTimerNs()(), 100);
  });
});
