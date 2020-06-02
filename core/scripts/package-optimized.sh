#!/usr/bin/env bash

echo "Packaging Optimized Domain"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

FILES_WITH_PRINTLN=$(grep -rnw $DIR'/../optic/shared/src/main/scala/' -e 'println' | wc -l)
if [[ $FILES_WITH_PRINTLN != *"1"* ]]; then
  echo "You are leaking println"
  grep -rnw $DIR'/../optic/shared/src/main/scala/' -e 'println'
  exit 1
fi

export SBT_OPTS="-Xmx2G -XX:+UseConcMarkSweepGC -XX:+CMSClassUnloadingEnabled -XX:MaxPermSize=2G -Xss2M  -Duser.timezone=GMT"
sbt fullOptJS
OUTPUT_FILE=../workspaces/domain/src/domain.js

mkdir -p $(dirname $OUTPUT_FILE)

cat optic/js/target/scala-2.12/optic-core-opt.js > $OUTPUT_FILE

echo "domain logic written to $OUTPUT_FILE"
