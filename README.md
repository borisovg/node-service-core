# node-service-core

This is a micro-framework for building Node.js services.

## Usage example

```bash
npm install @borisovg/service-core pino
```

```ts
import { load, setLogger } from '@borisovg/service-core';
import { pino } from 'pino';

setLogger(pino());
void load(`${__dirname}/modules`);
```

## Plugin pattern

The basic idea behind the framework is the ability to (recursively) auto-load program files from a given directory without having explicitly know about the existence of individual files.
This allows for rapid development of autonomous or loosely-coupled components.
An example of where this might be immediately useful is a collection of HTTP API handlers, that can be split into individual files, each housed in a domain-specific sub-directory - something that normally would require tedious boilerplate to load at startup.

In addition to auto-loading, each file can optionally export some hook methods:

- `$onBind(sr: ServiceRegistry, name: string) => Promise<void>` which are run first, blocking start-up until they complete
- `$onLoad(sr: ServiceRegistry, name: string) => Promise<void>` which are run after, blocking start-up until they complete
- `$onRun(sr: ServiceRegistry, name:string) => Promise<void>` which are run after, blocking start-up until they complete
- `$onShutdown(sr: ServiceRegistry, name: string) => Promise<void>` which are run at shutdown, blocking exit until they complete

As an contrived example, we can add the following under `modules/loop.ts`:

```ts
import { getLogger } from '@borisovg/service-core';

const log = getLogger();
let timeout: NodeJS.Timeout;

export function $onLoad() {
  timeout = setInterval(() => {
    log.info({ message: 'TICK' });
  }, 1000);
}

export function $onShutdown() {
  clearInterval(timeout);
}
```

This module will start logging messages on startup and will clear the timeout before exiting.
Adding `$onShutdown()` hooks is particularly useful for stopping various event loops during testing, as these may otherwise prevent the test runner from exiting.

## Service Registry

The module hook methods will be called with a service registry object.
Modules can add new methods and call methods defined by other modules.
During testing this also makes it easy to mock these methods as required.

As a contrived example our `modules/foo.ts` will add a method to the service registry and re-implement the loop from the example above using built-in loops module:

```ts
import type { CoreServiceRegistry } from '@borisovg/service-core';

// defined this in top-level "types.ts" file to include all methods your application adds
export type ServiceRegistry = CoreServiceRegistry & {
  hello: {
    greet: (name: string) => void;
  };
};

// only use "$onBind" to add methods to the registry
export function $onBind(sr: ServiceRegistry) {
  sr.hello = {
    greet(name) {
      console.log(`Hello ${name}!`);
    },
  };
}

export function $onRun(sr: ServiceRegistry, name: string) {
  sr.core.loops.add(name, 1000, () => {
    sr.hello.greet('World');
  });
}
```
