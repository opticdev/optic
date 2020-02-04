#!/usr/bin/env bash
sbt fastOptJS
OUTPUT_FILE=../workspaces/domain/src/domain.js

mkdir -p $(dirname $OUTPUT_FILE)

cat target/scala-2.12/optic-core-fastopt.js > $OUTPUT_FILE

sbt publishLocal

echo "domain logic written to $OUTPUT_FILE"
