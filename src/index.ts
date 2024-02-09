import { loadModules } from './modules';
import * as shutdown from './shutdown';

export { getLogger, setLogger } from './logger';
export { getName, loadModules } from './modules';
export * from './timing';
export * as shutdown from './shutdown';
export type * from './types';

let firstLoad = true;

export async function load(path?: string) {
  if (!firstLoad) {
    shutdown.run(() => {});
  }

  firstLoad = false;
  await loadModules(`${__dirname}/modules`, 'core');

  if (path) {
    await loadModules(path);
  }
}
