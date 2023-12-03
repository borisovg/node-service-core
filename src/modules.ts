import { readdir, stat } from 'fs/promises';
import { getLogger } from './logger';
import { add as addShutdown } from './shutdown';
import type { Module } from './types';

const log = getLogger();
type Modules = [string, string, Module][];

export function getName(path: string, parent?: string) {
  const file = path.split('/').pop();
  if (!file) {
    throw new Error(`Bad path: ${path}`);
  }

  const name = file.replace(/\.(js|ts)$/, '');
  return parent ? [parent, name].join(':') : name;
}

export async function loadModules(path: string, prefix = '') {
  const mods = await loadPath(path, []);
  const promises = [];

  for (const mod of mods) {
    const { $onLoad, $onShutdown } = mod[2];
    const name = prefix ? `${prefix}:${mod[1]}` : mod[1];

    if ($onShutdown) {
      addShutdown(name, () => $onShutdown(name));
    }

    if ($onLoad) {
      log.trace({
        file: { path: path },
        labels: { name, hook: '$onLoad' },
        message: 'running hook',
      });

      promises.push($onLoad(name));
    }
  }

  await Promise.all(promises);

  for (const mod of mods) {
    const { $onRun } = mod[2];

    if ($onRun) {
      const name = prefix ? `${prefix}:${mod[1]}` : mod[1];

      log.trace({
        file: { path: mod[0] },
        labels: { name, hook: '$onRun' },
        message: 'running hook',
      });

      $onRun(name);
    }
  }

  log.debug({ file: { path }, message: 'done loading modules' });
}

async function loadDir(path: string, mods: Modules, parent?: string) {
  let name: string | undefined = getName(path, parent);
  if (name === 'modules') {
    name = undefined;
  }

  const files = await readdir(path);
  await Promise.all(files.map((f) => loadPath(`${path}/${f}`, mods, name)));
}

async function loadPath(path: string, mods: Modules, parent?: string) {
  const stats = await stat(path);

  if (stats.isDirectory()) {
    await loadDir(path, mods, parent);
  } else if (
    !path.includes('.d.') &&
    !path.includes('.spec.') &&
    !path.includes('.test.') &&
    /\.(js|ts)$/.exec(path)
  ) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mods.push([path, getName(path, parent), require(path) as Module]);
  }

  return mods;
}
