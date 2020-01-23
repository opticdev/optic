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
@useoptic/cli/0.1.0 darwin-x64 node-v10.18.1
$ api --help [COMMAND]
USAGE
  $ api COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`api daemon:stop`](#api-daemonstop)
* [`api help [COMMAND]`](#api-help-command)
* [`api init`](#api-init)
* [`api run [TASKNAME]`](#api-run-taskname)
* [`api spec`](#api-spec)
* [`api start`](#api-start)

## `api daemon:stop`

ensures the Optic daemon has been stopped

```
USAGE
  $ api daemon:stop
```

_See code: [src/commands/daemon/stop.ts](https://github.com/opticdev/optic-2020/blob/v0.1.0/src/commands/daemon/stop.ts)_

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

_See code: [src/commands/init.ts](https://github.com/opticdev/optic-2020/blob/v0.1.0/src/commands/init.ts)_

## `api run [TASKNAME]`

Run a task from your optic.yml

```
USAGE
  $ api run [TASKNAME]
```

_See code: [src/commands/run.ts](https://github.com/opticdev/optic-2020/blob/v0.1.0/src/commands/run.ts)_

## `api spec`

Open your Optic API specification

```
USAGE
  $ api spec
```

_See code: [src/commands/spec.ts](https://github.com/opticdev/optic-2020/blob/v0.1.0/src/commands/spec.ts)_

## `api start`

starts your API process behind a proxy

```
USAGE
  $ api start
```

_See code: [src/commands/start.ts](https://github.com/opticdev/optic-2020/blob/v0.1.0/src/commands/start.ts)_
<!-- commandsstop -->
