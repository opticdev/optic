#!/usr/bin/env bash
# usage: $ source ./sourceme.sh
export OPTIC_SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo "Optic development scripts will run from $OPTIC_SRC_DIR"
export OPTIC_DEBUG_ENV_FILE="$OPTIC_SRC_DIR/.env"

alias uidev="OPTIC_DAEMON_ENABLE_DEBUGGING=yes OPTIC_DEVELOPMENT=yes OPTIC_UI_HOST=http://localhost:3000 OPTIC_AUTH_UI_HOST=http://localhost:4005 $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"
alias apidev="OPTIC_DAEMON_ENABLE_DEBUGGING=yes OPTIC_DEVELOPMENT=yes OPTIC_AUTH_UI_HOST=http://localhost:4005 $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"
alias apistage="OPTIC_DAEMON_ENABLE_DEBUGGING=yes $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"

# echo "You can run otask from anywhere to run task from $OPTIC_SRC_DIR"
otask() {
  cd "$OPTIC_SRC_DIR" && task "$@"
}

# echo "You can run optic_export_env <ENV_FILE_PATH> from anywhere to export all the variables from <ENV_FILE_PATH>"
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