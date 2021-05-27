# Optic Engine written in Rust

## Dependencies

This project is written in Rust, which compiles to a _binary_ for your local system. To install all the basics you need (Rust compiler + Cargo), the recommended way is to use [the official Rust Up project](https://rustup.rs). On Linux or macOS, that comes down to running (if you trust executing curled shell scripts):

```
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

If you're on Windows or want to know more about how to get the basic Rust toolchain in place, this [Installation Chapter of the Official Rust Book](https://doc.rust-lang.org/stable/book/ch01-01-installation.html).

## Building the binary and accompanying Node.js + WASM packages

The recommended way to build a development binary and WASM packages is to use the following commands from the repository root:

```
$ task workspaces:build
$ cargo build
```

## Running end-to-end

To test the development binary and WASM packages through the Optic product, as opposed to running the automated tests, use the standalone `cli-server`:

```
$ task workspaces:build
$ node --inspect-brk workspaces/cli-server/build/standalone-server.js /path/to/your/api/project
```

Or, run the `apidev start` command made available through `source sourceme.sh` from the repository root, which runs the `cli-server` as a daemon. Because it is a daemon, you may need to restart it via `apidev daemon:stop` to pick up the latest changes:

```
$ source sourceme.sh
$ apidev start
```
