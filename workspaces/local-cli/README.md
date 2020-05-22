local-cli
=========

CLI to document your API and generate artifacts

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/local-cli.svg)](https://npmjs.org/package/local-cli)
[![Downloads/week](https://img.shields.io/npm/dw/local-cli.svg)](https://npmjs.org/package/local-cli)
[![License](https://img.shields.io/npm/l/local-cli.svg)](https://github.com/opticdev/optic-2020/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @useoptic/cli
$ api COMMAND
running command...
$ api (-v|--version|version)
@useoptic/cli/8.0.7 darwin-x64 node-v12.4.0
$ api --help [COMMAND]
USAGE
  $ api COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`api agent:start`](#api-agentstart)
* [`api check [TASKNAME]`](#api-check-taskname)
* [`api generate:oas`](#api-generateoas)
* [`api help [COMMAND]`](#api-help-command)
* [`api init`](#api-init)
* [`api login`](#api-login)
* [`api logout`](#api-logout)
* [`api run [TASKNAME]`](#api-run-taskname)
* [`api spec`](#api-spec)
* [`api start`](#api-start)

## `api agent:start`

starts your API process behind a proxy and sends traffic metadata to the cloud

```
USAGE
  $ api agent:start
```

_See code: [src/commands/agent/start.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/agent/start.ts)_

## `api check [TASKNAME]`

Validate the correctness of a task in your optic.yml

```
USAGE
  $ api check [TASKNAME]
```

_See code: [src/commands/check.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/check.ts)_

## `api generate:oas`

export an OpenAPI 3.0.1 spec

```
USAGE
  $ api generate:oas

OPTIONS
  --json
  --yaml
```

_See code: [src/commands/generate/oas.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/generate/oas.ts)_

## `api help [COMMAND]`

display help for api

```
USAGE
  $ api help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `api init`

Add Optic to your API

```
USAGE
  $ api init
```

_See code: [src/commands/init.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/init.ts)_

## `api login`

Login to Optic from the CLI

```
USAGE
  $ api login
```

_See code: [src/commands/login.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/login.ts)_

## `api logout`

Logout from Optic

```
USAGE
  $ api logout
```

_See code: [src/commands/logout.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/logout.ts)_

## `api run [TASKNAME]`

Run a task from your optic.yml

```
USAGE
  $ api run [TASKNAME]
```

_See code: [src/commands/run.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/run.ts)_

## `api spec`

Open your Optic API specification

```
USAGE
  $ api spec
```

_See code: [src/commands/spec.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/spec.ts)_

## `api start`

starts your API process behind a proxy

```
USAGE
  $ api start
```

_See code: [src/commands/start.ts](https://github.com/useoptic/optic-package/blob/v8.0.7/src/commands/start.ts)_
<!-- commandsstop -->
