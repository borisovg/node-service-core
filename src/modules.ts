/* eslint-disable @typescript-eslint/no-require-imports */
import { readdir, stat } from 'fs/promises';
import { getLogger } from './logger';
import { add as addShutdown } from './modules/shutdown';
import type { Module, ModuleHookFn, CoreServiceRegistry } from './types';

const log = getLogger();
type Modules = [string, string, Module][];

export function getName(path: string, parent?: string) {
  const name = path
    .replace(/\.(js|ts)$/, '')
    .split(/[./]/)
    .pop();

  if (!name) {
    throw new Error(`Bad path: "${path}"`);
  }

  return parent ? [parent, name].join(':') : name;
}

export async function loadModules<T extends CoreServiceRegistry>(
  sr: Record<string, unknown>,
  path: string,
  prefix = '',
) {
  const mods = await loadPath(path, []);
  const phase1 = [];
  const phase2 = [];
  const phase3 = [];

  for (const mod of mods) {
    const { $onBind, $onLoad, $onRun, $onShutdown } = mod[2];
    const name = prefix ? `${prefix}:${mod[1]}` : mod[1];

    if ($onShutdown) {
      addShutdown(name, async () =>
        $onShutdown(sr as CoreServiceRegistry, name),
      );
    }

    if ($onBind) {
      phase1.push(['$onBind', name, path, $onBind] as const);
    }

    if ($onLoad) {
      phase2.push(['$onLoad', name, path, $onLoad] as const);
    }

    if ($onRun) {
      phase3.push(['$onRun', name, path, $onRun] as const);
    }
  }

  await runHooks(sr as CoreServiceRegistry, phase1);
  await runHooks(sr as CoreServiceRegistry, phase2);
  await runHooks(sr as CoreServiceRegistry, phase3);

  log.debug({ file: { path }, message: 'done loading modules' });

  return sr as T;
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
    !path.includes('.test.')
  ) {
    const ext = /\.(js|mjs|ts)$/.exec(path)?.[1];
    if (ext) {
      const mod =
        ext === 'mjs'
          ? await eval('(async () => import(path))()') // dirty hack to prevent TS from mangling the import call
          : require(path);
      mods.push([path, getName(path, parent), mod as Module]);
    }
  }

  return mods;
}

function runHooks(
  sr: CoreServiceRegistry,
  list: (readonly [string, string, string, ModuleHookFn])[],
) {
  return Promise.all(
    list.map(([type, name, path, fn]) => {
      log.trace({
        file: { path: path },
        labels: { name, hook: type },
        message: 'running hook',
      });

      return fn(sr, name);
    }),
  );
}
