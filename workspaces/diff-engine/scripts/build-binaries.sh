#!/bin/bash -e
if [ "$OPTIC_RUST_DIFF_ENGINE" != "true" ]; then
  echo 'Skipping building of Rust diff engine'
  exit 0;
fi

node scripts/uninstall
cargo build