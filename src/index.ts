import { loadModules } from './modules';
import { run as shutdown } from './modules/shutdown';
import { CoreServiceRegistry } from './types';

export { config } from './modules/config';
export { getLogger, setLogger } from './logger';
export { getName } from './modules';
export type * from './types';
export { shutdown };

let firstLoad = true;

export async function load<T extends CoreServiceRegistry>(
  path?: string | string[],
  registry?: T,
) {
  if (!firstLoad) {
    shutdown(() => {});
  }

  const sr = registry || {};

  firstLoad = false;
  await loadModules<T>(sr, `${__dirname}/modules`, 'core');

  if (typeof path === 'string') {
    await loadModules(sr, path);
  } else if (path) {
    for (const p of path) {
      if (p) {
        await loadModules(sr, p);
      }
    }
  }
}
