#!/bin/bash -e

yarn run tsc -b --verbose

if [ "$OPTIC_RUST_DIFF_ENGINE" != "true" ]; then
  exit 0;
fi

cargo build