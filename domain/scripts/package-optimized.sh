#!/usr/bin/env bash
sbt fullOptJS
OUTPUT_FILE=./build/domain.js
API_CLI_FILE=../api-cli/provided/domain.js

mkdir -p `dirname $OUTPUT_FILE`
mkdir -p `dirname $API_CLI_FILE`

echo "/* eslint-disable */\n" > $OUTPUT_FILE
echo "/* eslint-disable */\n" > $API_CLI_FILE
cat target/scala-2.12/seamless-ddd-opt.js >> $OUTPUT_FILE
cat target/scala-2.12/seamless-ddd-opt.js >> $API_CLI_FILE

echo "domain logic written to $OUTPUT_FILE"
echo "domain logic written to $API_CLI_FILE"
