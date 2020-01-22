#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
alias apidev="$DIR/workspaces/local-cli/bin/run"
alias watch-optic="yarn wsrun -p '@useoptic/*' -c watch 'yarn run ws:build' './src'"
alias rescue-optic="rm -rf ~/.optic/daemon-lock.json.lock/ ~/.optic/daemon-lock.json"
