# Optic Engine written in Rust

Contains all the core logic that makes Optic what it is, as a Rust crate. It is designed to be consumed by other crates that provide interfaces into it for specific targets, like `optic-engine-native` and `optic-engine-wasm`.

## Dependencies

This project is written in Rust. To install all the basics you need to make a build (Rust compiler + Cargo), the recommended way is to use [the official Rust Up project](https://rustup.rs). On Linux or macOS, that comes down to running (if you trust executing curled shell scripts):

```
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

If you're on Windows or want to know more about how to get the basic Rust toolchain in place, this [Installation Chapter of the Official Rust Book](https://doc.rust-lang.org/stable/book/ch01-01-installation.html).
