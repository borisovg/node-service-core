import { throws } from 'assert';
import { getName } from './modules';

describe('modules', () => {
  it('getModules() checks for invalid paths', () => {
    throws(() => getName(''), new Error('Bad path: ""'));
    throws(() => getName('/'), new Error('Bad path: "/"'));
    throws(() => getName('./'), new Error('Bad path: "./"'));
  });
});
