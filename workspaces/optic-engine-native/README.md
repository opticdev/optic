# Native interface to Optic Engine

The highest performance way to call the Optic engine by providing native ways to call the Optic engine, enabling concurrency through threads:

- **CLI binary**. Pre-built binaries for all supported versions are published for every published version of Optic.
- **Node.js library**, which installs a pre-built binary upon installation as an npm package and spawns a new process for each call to it. Typescript definitions come included.

## Development Dependencies

This project is written in Rust. To install all the basics you need (Rust compiler + Cargo) to make a build, the recommended way is to use [the official Rust Up project](https://rustup.rs). On Linux or macOS, that comes down to running (if you trust executing curled shell scripts):

```
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

If you're on Windows or want to know more about how to get the basic Rust toolchain in place, this [Installation Chapter of the Official Rust Book](https://doc.rust-lang.org/stable/book/ch01-01-installation.html).

## Building the binary and accompanying Node.js

The recommended way to build a development binary is to use the following commands from the repository root:

```
$ task workspaces:build
```

## Usage

To use the CLI directly, in repository root run:

```
$ cargo run

error: The following required arguments were not provided:
    <SPEC_PATH>

USAGE:
    optic_diff [FLAGS] <SPEC_PATH> [SUBCOMMAND]

For more information try --help
```

For use in Node.js, install the npm package and import it:

```js
// CommonJS
const OpticEngine = require('@useoptic/optic-engine-native');

// ESM / Typescript
import * as OpticEngine from '@useoptic/optic-engine-native';
```

## Running end-to-end

To test the development binary packages through the Optic product, as opposed to running the automated tests, use the standalone `cli-server`:

```
$ task workspaces:build
$ node --inspect-brk workspaces/cli-server/build/standalone-server.js /path/to/your/api/project
```

Or, run the `apidev start` command made available through `source sourceme.sh` from the repository root, which runs the `cli-server` as a daemon. Because it is a daemon, you may need to restart it via `apidev daemon:stop` to pick up the latest changes:

```
$ source sourceme.sh
$ apidev start
```
