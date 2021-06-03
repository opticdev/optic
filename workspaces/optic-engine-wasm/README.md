# WASM interface to Optic Engine

The (probably) most portable way to call the Optic Engine is by using it's WASM interface. If high performance / concurrency is required, consider using `optic-engine-native`.

Two builds are provided: one for Node.js, one for use in browsers (see Usage).

## Development Dependencies

This project is written in Rust. To install all the basics you need (Rust compiler + Cargo) to make a build, the recommended way is to use [the official Rust Up project](https://rustup.rs). On Linux or macOS, that comes down to running (if you trust executing curled shell scripts):

```
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

If you're on Windows or want to know more about how to get the basic Rust toolchain in place, this [Installation Chapter of the Official Rust Book](https://doc.rust-lang.org/stable/book/ch01-01-installation.html).

## Building the WASM interface

The recommended way to create a build is to use the following commands from the repository root:

```
$ task workspaces:build
```

For projects that use Webpack as a bundler, a plugin is provided to automatically build as part of a Webpack build. It supports the WebpackDevServer by watching the Rust code for changes and automatically triggering rebuilds.

```js
const OpticWasmWebpackPlugin = require('@useoptic/optic-engine-wasm/webpack.plugin');

const pluginInstance = new OpticWasmWebpackPlugin(); // for use in config.plugins
```

## Usage

Node.js and browsers load WASM modules in a significantly different way. As such, there's two libraries that are built and exposed.

For use in Node.js, install the npm package and import it from the root name:

```js
// CommonJS
const OpticEngine = require('@useoptic/optic-engine-wasm');

// ESM / Typescript
import * as OpticEngine from '@useoptic/optic-engine-wasm';
```

For use in a browser, use the `/browser` suffix:

```js
// CommonJS
const OpticEngine = require('@useoptic/optic-engine-wasm/browser');

// ESM / Typescript
import * as OpticEngine from '@useoptic/optic-engine-wasm/browser';
```

## Running end-to-end

To test the WASM packages through the Optic product, as opposed to running the automated tests, use the standalone `cli-server`:

```
$ task workspaces:build
$ node --inspect-brk workspaces/cli-server/build/standalone-server.js /path/to/your/api/project
```

Or, run the `apidev start` command made available through `source sourceme.sh` from the repository root, which runs the `cli-server` as a daemon. Because it is a daemon, you may need to restart it via `apidev daemon:stop` to pick up the latest changes:

```
$ source sourceme.sh
$ apidev start
```
