#!/bin/bash -e

if [ "$OPTIC_RUST_DIFF_ENGINE" != "true" ]; then
  exit 0;
fi

cargo test
npm test