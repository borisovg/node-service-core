export type Module = NodeModule & {
  $onLoad?: (name: string) => Promise<void>;
  $onRun?: (name: string) => void;
  $onShutdown?: (name: string) => Promise<void>;
};

export type Logger = {
  debug(params: LogParams): void;
  error(params: LogParams): void;
  info(params: LogParams): void;
  warn(params: LogParams): void;
  trace(params: LogParams): void;
};

type LogParams = Record<string, unknown>;
