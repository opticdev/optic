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
@useoptic/cli/0.1.0 darwin-x64 node-v13.5.0
$ api --help [COMMAND]
USAGE
  $ api COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`api daemon:stop [FILE]`](#api-daemonstop-file)
* [`api help [COMMAND]`](#api-help-command)
* [`api start`](#api-start)

## `api daemon:stop [FILE]`

describe the command here

```
USAGE
  $ api daemon:stop [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
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

## `api start`

starts your API process behind a proxy

```
USAGE
  $ api start
```

_See code: [src/commands/start.ts](https://github.com/opticdev/optic-2020/blob/v0.1.0/src/commands/start.ts)_
<!-- commandsstop -->
