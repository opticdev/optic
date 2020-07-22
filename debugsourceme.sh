#!/usr/bin/env bash
# usage: $ source ./debugsourceme.sh
export OPTIC_SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

debug_to_capture() {
  (
    set -o errexit
    node "$OPTIC_SRC_DIR/workspaces/cli-shared/build/captures/avro/file-system/dump-capture-saver.js" $1 .
  )
}

clear_events() {
  (
    set -o errexit
    node "$OPTIC_SRC_DIR/support/remove-all-events.js" $1 .
  )
}