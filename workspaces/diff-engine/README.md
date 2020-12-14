## Optic Diff engine written in Rust

## Building

### Dependencies

This project is written in Rust, which compiles to a _binary_ for your local system. To install all the basics you need (Rust compiler + Cargo), the recommended way is to use [the official Rust Up project](https://rustup.rs). On Linux or macOS, that comes down to running (if you trust executing curled shell scripts):

```
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

If you're on Windows or want to know more about how to get the basic Rust toolchain in place, this [Installation Chapter of the Official Rust Book](https://doc.rust-lang.org/stable/book/ch01-01-installation.html).

## Building the binary and accompanying Node.js package

Building this package is protected through a feature flag. This is to make sure builds are not attempted without opting-in and making sure the dependencies are in order.

The recommended way is to use the `optic_build` command made available through `source sourceme.sh` from the repository root:

```
OPTIC_RUST_DIFF_ENGINE=true optic_build
```

Because that's easy to get wrong, and the feature flag is also needed for running, it's recommended to use an `.env` file in the project root. You might have to create it, as the `.env` file is not meant to be committed and local to your system. To this file add the following line, so it's picked up automatically through all the `optic_*` and `*dev` commands provided:

```
OPTIC_RUST_DIFF_ENGINE=true
```

With this `.env` file in place and the line added to it, running `optic_build` is enough to create a build with the engine enabled.

Alternatively, to only byiuld a version of this package, with all dependencies installed, run (yarn):

```
OPTIC_RUST_DIFF_ENGINE=true yarn run ws:build
```

or (npm):

```
OPTIC_RUST_DIFF_ENGINE=true npm run ws:build
```

## Running end-to-end

As with the building, use of this engine is hidden behind a featuer flag. With a build that had the feature enabled, the recommended way is to use the `apidev start` command made available through `source sourceme.sh` from the repository root:

```
OPTIC_RUST_DIFF_ENGINE=true apidev start
```

Because that's easy to get wrong, and the feature flag is also needed for building, it's recommended to use an `.env` file in the project root. You might have to create it, as the `.env` file is not meant to be committed and local to your system. To this file add the following line, so it's picked up automatically through all the `optic_*` and `*dev` commands provided:

```
OPTIC_RUST_DIFF_ENGINE=true
```

With this `.env` file in place and the line added to it, running `apidev start` is enough to create a build with the engine enabled.

Once a version of the Optic daemon is running, any diffs performed through visiting the UI are performed using this experimental engine. One could verify by looking for a process called `optic_diff` during diffing.

Note: you might have to run `apidev daemon:stop` to spin down running Optic daemon, so it can be restarted with the feature flag enabled.
