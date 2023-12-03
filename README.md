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

- `$onLoad() => Promise<void>` which are run first, blocking start-up until they complete
- `$onRun() => void` which are run next but are non-blocking
- `$onShutdown() => Promise<void>` which are run at shutdown, blocking exit until they complete

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
