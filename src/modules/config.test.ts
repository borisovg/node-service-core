import { strictEqual } from 'node:assert';
import type { CoreServiceRegistry } from '..';
import { loadModules } from '../modules';
import { config } from './config';

describe('modules/config', () => {
  const sr = {} as CoreServiceRegistry;

  beforeAll(async () => {
    await loadModules(sr, `${__dirname}/config.ts`);
  });

  it('adds config to the service registry', () => {
    strictEqual(sr.core.config, config);
  });
});
