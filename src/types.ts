import type { config } from './modules/config';
import type { LoopsModule } from './modules/loops/loop-store';
import type * as shutdown from './modules/shutdown';
import type * as timing from './modules/timing';

export type CoreServiceRegistry = {
  core: {
    config: typeof config;
    loops: LoopsModule;
    timing: {
      makeTimer: typeof timing.makeTimer;
      makeTimerNs: typeof timing.makeTimerNs;
    };
    shutdown: {
      add: typeof shutdown.add;
      run: typeof shutdown.run;
    };
  };
};

export type Logger = {
  debug(params: LogParams): void;
  error(params: LogParams): void;
  info(params: LogParams): void;
  warn(params: LogParams): void;
  trace(params: LogParams): void;
};

export type Module = {
  $onBind?: ModuleHookFn;
  $onLoad?: ModuleHookFn;
  $onRun?: ModuleHookFn;
  $onShutdown?: ModuleHookFn;
};

export type ModuleHookFn<T = CoreServiceRegistry> = (
  sr: T,
  name: string,
) => Promise<void> | void;

type LogParams = Record<string, unknown>;
