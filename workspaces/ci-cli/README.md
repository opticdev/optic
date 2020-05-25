@useoptic/agent-cli
===================



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@useoptic/agent-cli.svg)](https://npmjs.org/package/@useoptic/agent-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@useoptic/agent-cli.svg)](https://npmjs.org/package/@useoptic/agent-cli)
[![License](https://img.shields.io/npm/l/@useoptic/agent-cli.svg)](https://github.com/opticdev/optic/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @useoptic/agent-cli
$ optic-agent COMMAND
running command...
$ optic-agent (-v|--version|version)
@useoptic/agent-cli/0.1.0 darwin-x64 node-v12.16.2
$ optic-agent --help [COMMAND]
USAGE
  $ optic-agent COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`optic-agent hello [FILE]`](#optic-agent-hello-file)
* [`optic-agent help [COMMAND]`](#optic-agent-help-command)

## `optic-agent hello [FILE]`

describe the command here

```
USAGE
  $ optic-agent hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ optic-agent hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/opticdev/optic/blob/v0.1.0/src/commands/hello.ts)_

## `optic-agent help [COMMAND]`

display help for optic-agent

```
USAGE
  $ optic-agent help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.0.1/src/commands/help.ts)_
<!-- commandsstop -->
