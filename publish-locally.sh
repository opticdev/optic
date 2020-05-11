#!/usr/bin/env bash

if [[ -z "$1" ]]
  then
    echo "No version provided"
    exit 1
fi


yarn run bump "$1"

yarn install
source ./export_development_aliases.sh
yarn run build-domain
yarn wsrun --stages --report --fast-exit ws:build

cd $OPTIC_SRC_DIR && yarn run registry:clean-optic && yarn run registry:start-background && yarn run publish-local
YARN_REGISTRY=http://localhost:4873 yarn global add @useoptic/cli --registry=http://localhost:4873