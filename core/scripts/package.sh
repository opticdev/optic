#!/usr/bin/env bash
export SBT_OPTS="-Xmx2G -XX:+UseConcMarkSweepGC -XX:+CMSClassUnloadingEnabled -XX:MaxPermSize=2G -Xss2M  -Duser.timezone=GMT"
sbt fastOptJS
OUTPUT_FILE=../workspaces/domain/src/domain.js

mkdir -p $(dirname $OUTPUT_FILE)

cat optic/js/target/scala-2.12/optic-core-fastopt.js > $OUTPUT_FILE

echo "domain logic written to $OUTPUT_FILE"
