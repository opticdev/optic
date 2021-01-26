#!/usr/bin/env bash
# usage: $ source ./sourceme.sh
export OPTIC_SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo "Optic development scripts will run from $OPTIC_SRC_DIR"
export OPTIC_DEBUG_ENV_FILE="$OPTIC_SRC_DIR/.env"

alias apidev="OPTIC_DAEMON_ENABLE_DEBUGGING=yes OPTIC_DEVELOPMENT=yes OPTIC_UI_HOST=http://localhost:3000 OPTIC_AUTH_UI_HOST=http://localhost:4005 $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"
alias apistage="OPTIC_DAEMON_ENABLE_DEBUGGING=yes $OPTIC_SRC_DIR/workspaces/local-cli/bin/run"
alias cidev="$OPTIC_SRC_DIR/workspaces/ci-cli/bin/run"
alias agentdev="$OPTIC_SRC_DIR/workspaces/agent-cli/bin/run"
optic_workspace_clean() {
  (
    set -o errexit
    export $(grep -v '^#' $OPTIC_DEBUG_ENV_FILE | xargs) # export all in .env file
    cd "$OPTIC_SRC_DIR"
    yarn wsrun --stages --report --fast-exit ws:clean
  )
}
optic_workspace_build() {
  (
    set -o errexit
    export $(grep -v '^#' $OPTIC_DEBUG_ENV_FILE | xargs) # export all in .env file
    cd "$OPTIC_SRC_DIR"
    yarn wsrun --stages --report --fast-exit --exclude-missing ws:build
  )
}
optic_workspace_binaries_build() {
  (
    set -o errexit
    export $(grep -v '^#' $OPTIC_DEBUG_ENV_FILE | xargs) # export all in .env file
    cd "$OPTIC_SRC_DIR"
    yarn wsrun --stages --report --fast-exit --exclude-missing ws:build-binaries
  )
}
optic_workspace_build_with_notification() {
  (
    set -o errexit
    optic_workspace_build && sh ./workspace-scripts/build/on-success.sh || sh ./workspace-scripts/build/on-failure.sh
  )
}
optic_watch() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"
    export $(grep -v '^#' $OPTIC_DEBUG_ENV_FILE | xargs) # export all in .env file
    optic_workspace_clean
    yarn run watch --filter=workspace-scripts/watch-filter.js "source sourceme.sh && optic_workspace_build_with_notification"
  )
}
check_ws() {
  yarn workspaces info | sed -e '2,$!d' -e '$d' | jq -r 'keys[] as $k | "\($k): \(.[$k].mismatchedWorkspaceDependencies)"'
}
alias check-workspace-dependencies="check-ws"
show_ws_versions() {
  find ./workspaces -type f -iname package.json -not -path "*node_modules*" -print0 | xargs -0 cat | jq ".name, .version"
}
alias wsinfo="show-ws-versions"
search_ws() {
  find ./workspaces -type f -not -path "*node_modules*" -print0 | xargs -0 grep -il $@
}
optic_install_dependencies() {
  (
    set -o errexit;
#    OPTIC_SKIP_PREBUILT_INSTALLS=true yarn install --verbose
    OPTIC_SKIP_PREBUILT_INSTALLS=true yarn install
  )
}
optic_build() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"

    optic_install_dependencies
    optic_workspace_clean
    optic_workspace_binaries_build
    optic_workspace_build
  )
}

optic_build_with_linked_core() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"
    optic_workspace_clean
    yarn run bump-core-snapshot
    optic_install_dependencies
    optic_workspace_build
  )
}
bump_domain() {
  if [[ -z "$1" ]]; then
    echo "No version provided"
    exit 1
  fi
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"
    optic_workspace_clean
    yarn run bump-core $1
    optic_install_dependencies
    optic_workspace_build
  )
}

optic_build_for_release() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"

    optic_install_dependencies

    optic_workspace_clean
    optic_workspace_build
  )
}

optic_build_and_publish_locally() {
  (
    set -o errexit
    optic_build_for_release
    cd "$OPTIC_SRC_DIR"
    OPTIC_PUBLISH_SCOPE=private node ./workspaces/scripts/publish.js
  )
}
optic_release_and_install_locally() {
  if [[ -z "$1" ]]; then
    echo "No version provided"
    exit 1
  fi
  (
    set -o errexit

    cd "$OPTIC_SRC_DIR"
    yarn run bump "$1"

    optic_build_and_publish_locally
    optic_install_from_local_registry
  )
}
optic_install_from_local_registry() {
  (
    set -o errexit
    YARN_REGISTRY=http://localhost:4873 yarn global add @useoptic/cli --registry=http://localhost:4873
    YARN_REGISTRY=http://localhost:4873 yarn global add @useoptic/agent-cli --registry=http://localhost:4873
    YARN_REGISTRY=http://localhost:4873 yarn global add @useoptic/ci-cli --registry=http://localhost:4873
  )
}
# DEBUG=optic* apidev daemon:stop && DEBUG=optic* apidev agent:start
optic_local_registry_start() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"
    cd docker/private-npm-registry
    docker-compose up &

    cd "$OPTIC_SRC_DIR"
    optic_install_dependencies
    yarn wait-on http://localhost:4873
    printf "local npm registry started on http://localhost:4873 \n"
  )
}


optic_compare_diff_engines() {
  echo "optic_compare_diff_engines"
  rm -rf ./issues.patch
  rm -rf ./issues-side-by-side.patch
  (
    set -o errexit
    API_PROJECT_DIR=./optic-snapshots
    NUM_INTERACTIONS=$1

    echo "running rust diff"
    cd "$API_PROJECT_DIR"
    rm -rfv ./.optic/captures/ccc/diffs/*
    export OPTIC_RUST_DIFF_ENGINE=true
    DEBUG=optic* "$OPTIC_SRC_DIR/workspaces/local-cli/bin/run" daemon:stop
    #@ENHANCEMENT instead of api spec, we can manually start/stop the session via the cli-server api
    DEBUG=optic* "$OPTIC_SRC_DIR/workspaces/local-cli/bin/run" spec &
    sleep 5
    cd "$OPTIC_SRC_DIR"
    rm -rfv ./output-rust
    node ./workspaces/snapshot-tests/build/e2e/index.js ./output-rust "$API_PROJECT_DIR" "$NUM_INTERACTIONS"

    echo "running scalajs diff"
    cd "$API_PROJECT_DIR"
    rm -rfv ./.optic/captures/ccc/diffs/*
    export OPTIC_RUST_DIFF_ENGINE=false
    DEBUG=optic* "$OPTIC_SRC_DIR/workspaces/local-cli/bin/run" daemon:stop
    DEBUG=optic* "$OPTIC_SRC_DIR/workspaces/local-cli/bin/run" spec

    cd "$OPTIC_SRC_DIR"
    rm -rfv ./output-scalajs
    node ./workspaces/snapshot-tests/build/e2e/index.js ./output-scalajs "$API_PROJECT_DIR" "$NUM_INTERACTIONS"

    echo "comparing..."
    cd "$OPTIC_SRC_DIR"
    diff ./output-rust ./output-scalajs > ./issues.patch || echo "found difference"
    diff --side-by-side ./output-rust ./output-scalajs > ./issues-side-by-side.patch || echo "found difference"
  )
  cat ./output-rust/*
  cat ./output-scalajs/*
  cat ./issues.patch
  cat ./issues-side-by-side.patch
}

optic_snapshot_input_to_capture() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"
    CAPTURE_ID=ccc
    API_PROJECT_DIR=./optic-snapshots
    INPUT_EVENTS_FILE=./workspaces/snapshot-tests/inputs/events/todo/v0.json
    INPUT_INTERACTIONS_FILE=./workspaces/snapshot-tests/inputs/interactions/todo/get-todos.json
    node ./workspaces/cli-shared/build/captures/avro/file-system/snapshot-input-capture-saver.js "$INPUT_EVENTS_FILE" "$INPUT_INTERACTIONS_FILE" "$API_PROJECT_DIR" "$CAPTURE_ID"
  )
}

optic_example_input_to_capture() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"
    CAPTURE_ID=ccc
    API_PROJECT_DIR=./optic-snapshots
    INPUT_FILE=./workspaces/ui/public/example-sessions/diff-test-cases.json
#    INPUT_FILE=/Users/dev/Downloads/shape-diff-engine/a\ known\ field\ is\ missing.managed.json
#    INPUT_FILE='/Users/dev/Downloads/shape-diff-engine/a new field is provided in an optional nested object.managed.json'
    INPUT_FILE=$1
    node ./workspaces/cli-shared/build/captures/avro/file-system/dump-capture-saver.js "$INPUT_FILE" "$API_PROJECT_DIR" "$CAPTURE_ID"
  )
}

optic_e2e() {
  (
    set -o errexit;
    cd "$OPTIC_SRC_DIR"
    INPUT_DIR=$1
    for input in "$INPUT_DIR"/*;
      do
        optic_e2e_single "$input"
        #read -p "press any key to continue"
        #break
      done;
  )
}

optic_e2e_single() {
  (
    set -o errexit
    cd "$OPTIC_SRC_DIR"
    input=$1
    echo "$input"

    INPUT_FILE_NAME=$(basename "$input")
    OUTPUT_DIR="output/$INPUT_FILE_NAME"
    if [ -d "$OUTPUT_DIR" ]
    then
      echo "skipping..."
      exit
    fi

    rm -rfv "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"

    jq -r ".events" < "$input" > "$OUTPUT_DIR/input-events.json"
    jq -r ".session.samples" < "$input" > "$OUTPUT_DIR/input-interactions.json"

    NUM_INTERACTIONS=$(jq ".session.samples | length" < "$input")
    echo "interactions: $NUM_INTERACTIONS"

    optic_example_input_to_capture "$input" > "$OUTPUT_DIR/conversion.log" 2>&1
    optic_compare_diff_engines "$NUM_INTERACTIONS" > "$OUTPUT_DIR/comparison.log" 2>&1
    mv ./output-rust "$OUTPUT_DIR/output-rust"
    mv ./output-scalajs "$OUTPUT_DIR/output-scalajs"
  )
}
# ps aux | grep daemon-lock | cut -d" " -f 15 | xargs echo kill -9 | pbcopy

optic_ci_e2e() {
  (
    set -o errexit
    set -x
    set -v
    mkdir -p ./optic-snapshots
    NUM_INTERACTIONS=1
    INPUT_FILE_PATH=$1
    INPUT_FILE_NAME=$(basename "$INPUT_FILE_PATH")
    OUTPUT_DIR="output/$INPUT_FILE_NAME"
    mkdir -p "$OUTPUT_DIR"

    optic_example_input_to_capture "$INPUT_FILE_PATH" > "$OUTPUT_DIR/conversion.log" 2>&1
    optic_compare_diff_engines "$NUM_INTERACTIONS" > "$OUTPUT_DIR/comparison.log" 2>&1

    cat "$OUTPUT_DIR/conversion.log"
    cat "$OUTPUT_DIR/comparison.log"
  )
}

optic_ci_standard_streams_regression() {
  (
    set -o errexit
    set -x
    set -v

    API_PROJECT_DIR=./optic-snapshots
    mkdir -p "$API_PROJECT_DIR"

    NUM_INTERACTIONS=$1
    export OPTIC_RUST_DIFF_ENGINE=$2

    OUTPUT_DIR="output/$NUM_INTERACTIONS"
    mkdir -p "$OUTPUT_DIR"

    optic_example_input_to_capture_with_repetition "$NUM_INTERACTIONS"

    cd "$API_PROJECT_DIR"
    rm -rfv .optic/captures/ccc/diffs/*
    DEBUG=optic* "$OPTIC_SRC_DIR/workspaces/local-cli/bin/run" daemon:stop
    DEBUG=optic* "$OPTIC_SRC_DIR/workspaces/local-cli/bin/run" spec
    cd "$OPTIC_SRC_DIR"
    node ./workspaces/snapshot-tests/build/e2e/index.js "$OUTPUT_DIR" "$API_PROJECT_DIR" "$NUM_INTERACTIONS"
    cat $OUTPUT_DIR/*

    cd "$API_PROJECT_DIR"
    ls -lah .optic/captures/ccc/diffs/*
  )
}

optic_ci_standard_streams_regression__on_failure() {
  (
    set -o errexit
    set -x
    set -v

    API_PROJECT_DIR=./optic-snapshots
    cd "$API_PROJECT_DIR"
    ls -lah .optic/captures/ccc/diffs/*
    cat .optic/captures/ccc/diffs/**/diff-engine-output.log
  )
}

optic_example_input_to_capture_with_repetition() {
  (

    set -o errexit
    set -x
    set -v

    NUM_INTERACTIONS=$1

    cd "$OPTIC_SRC_DIR"
    CAPTURE_ID=ccc
    API_PROJECT_DIR=./optic-snapshots
    INPUT_EVENTS_FILE=./workspaces/snapshot-tests/inputs/events/todo/v0.json
    INPUT_INTERACTIONS_FILE=./workspaces/snapshot-tests/inputs/interactions/todo/get-todos.json

    API_PROJECT_DIR=./optic-snapshots
    mkdir -p "$API_PROJECT_DIR"

    node ./workspaces/cli-shared/build/captures/avro/file-system/replicated-interactions-capture-saver.js "$INPUT_EVENTS_FILE" "$INPUT_INTERACTIONS_FILE" "$API_PROJECT_DIR" "$CAPTURE_ID" "$NUM_INTERACTIONS"
  )
}