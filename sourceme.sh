#!/usr/bin/env bash
# usage: $ source ./sourceme.sh
export OPTIC_SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo "Optic development scripts will run from $OPTIC_SRC_DIR"
export OPTIC_DEBUG_ENV_FILE="$OPTIC_SRC_DIR/.env"

alias apidev="OPTIC_DAEMON_ENABLE_DEBUGGING=yes OPTIC_DEVELOPMENT=yes OPTIC_AUTH_UI_HOST=http://localhost:4005 $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"
alias apistage="OPTIC_DAEMON_ENABLE_DEBUGGING=yes $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"

otask() {
  cd "$OPTIC_SRC_DIR" && task "$@"
}

optic_export_env() {
  set -u

  ENV_FILE=$1
  if [ -f "$ENV_FILE" ]
  then
    export "$(grep -v '^#' $ENV_FILE)"
  else
    echo "Could not find env file '$ENV_FILE'."
  fi
}