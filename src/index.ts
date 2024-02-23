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

  const app = registry || {};

  firstLoad = false;
  await loadModules<T>(app, `${__dirname}/modules`, 'core');

  if (typeof path === 'string') {
    await loadModules(app, path);
  } else if (path) {
    for (const p of path) {
      await loadModules(app, p);
    }
  }
}
