@useoptic/ci-cli
===================



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@useoptic/ci-cli.svg)](https://npmjs.org/package/@useoptic/ci-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@useoptic/ci-cli.svg)](https://npmjs.org/package/@useoptic/ci-cli)
[![License](https://img.shields.io/npm/l/@useoptic/ci-cli.svg)](https://github.com/opticdev/optic/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @useoptic/ci-cli
$ optic-ci COMMAND
running command...
$ optic-ci (-v|--version|version)
@useoptic/ci-cli/0.1.0 darwin-x64 node-v12.16.2
$ optic-ci --help [COMMAND]
USAGE
  $ optic-ci COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`optic-ci hello [FILE]`](#optic-ci-hello-file)
* [`optic-ci help [COMMAND]`](#optic-ci-help-command)

## `optic-ci hello [FILE]`

describe the command here

```
USAGE
  $ optic-ci hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ optic-ci hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/opticdev/optic/blob/v0.1.0/src/commands/hello.ts)_

## `optic-ci help [COMMAND]`

display help for optic-ci

```
USAGE
  $ optic-ci help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.0.1/src/commands/help.ts)_
<!-- commandsstop -->
