#!/usr/bin/env bash
# usage: $ source ./sourceme.sh
export OPTIC_SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo "Optic development scripts will run from $OPTIC_SRC_DIR"
alias apidev="OPTIC_DAEMON_ENABLE_DEBUGGING=yes OPTIC_UI_HOST=http://localhost:3000 OPTIC_AUTH_UI_HOST=http://localhost:4005 $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"
alias apistage="OPTIC_DAEMON_ENABLE_DEBUGGING=yes $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"
alias rescue-optic="rm -rf ~/.optic/daemon-lock.json.lock/ ~/.optic/daemon-lock.json"
alias publish-optic-locally="cd $OPTIC_SRC_DIR && yarn run registry:clean-optic && yarn run registry:start-background && yarn run publish-local"
alias install-optic-from-local-registry="YARN_REGISTRY=http://localhost:4873 yarn global add @useoptic/cli --registry=http://localhost:4873"

watch-optic() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"
    yarn wsrun --stages --report --fast-exit ws:clean
    yarn run watch --filter=workspace-scripts/watch-filter.js "yarn wsrun --stages --report --fast-exit ws:build && sh ./workspace-scripts/build/on-success.sh || sh ./workspace-scripts/build/on-failure.sh"
  )
}
check-ws() {
  yarn workspaces info | sed -e '2,$!d' -e '$d' | jq -r 'keys[] as $k | "\($k): \(.[$k].mismatchedWorkspaceDependencies)"'
}
alias check-workspace-dependencies="check-ws"
show-ws-versions() {
  find ./workspaces -type f -iname package.json -not -path "*node_modules*" -print0 | xargs -0 cat | jq ".name, .version"
}
alias wsinfo="show-ws-versions"
search-ws() {
  find ./workspaces -type f -not -path "*node_modules*" -print0 | xargs -0 grep -il $@
}
optic-install() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"

    yarn install
    yarn run build-domain
    yarn wsrun --stages --report --fast-exit ws:clean
    yarn wsrun --stages --report --fast-exit ws:build
  )
}
install-and-publish() {
  (
    set -o errexit
    optic-install
    cd "$OPTIC_SRC_DIR"
    yarn run publish-local
  )
}
install-local() {
  cd "$OPTIC_SRC_DIR"
  if [[ -z "$1" ]]; then
    echo "No version provided"
    exit 1
  fi
  (
    set -o errexit

    yarn run bump "$1"

    install-and-publish
    install-optic-from-local-registry
  )
}
alias install-local="install-local"
# DEBUG=optic* apidev daemon:stop && DEBUG=optic* apidev agent:start
