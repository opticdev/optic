#!/usr/bin/env bash
sbt fastOptJS
OUTPUT_FILE=./build/domain.js
API_CLI_FILE=../api-cli/provided/domain.js

mkdir -p `dirname $OUTPUT_FILE`
mkdir -p `dirname $API_CLI_FILE`

echo "/* eslint-disable */\n" > $OUTPUT_FILE
echo "/* eslint-disable */\n" > $API_CLI_FILE
cat target/scala-2.12/optic-core-fastopt.js >> $OUTPUT_FILE
cat target/scala-2.12/optic-core-fastopt.js >> $API_CLI_FILE

echo "domain logic written to $OUTPUT_FILE"
echo "domain logic written to $API_CLI_FILE"
