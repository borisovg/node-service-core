import { throws } from 'assert';
import { getName, loadModules } from './modules';

describe('modules', () => {
  it('getModules() checks for invalid paths', () => {
    throws(() => getName(''), new Error('Bad path: ""'));
    throws(() => getName('/'), new Error('Bad path: "/"'));
    throws(() => getName('./'), new Error('Bad path: "./"'));
  });

  it('loads mjs module', async () => {
    await loadModules({}, `${__dirname}/modules/dummy-module.mjs`);
  });
});
