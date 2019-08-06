#!/usr/bin/env bash
sbt fullOptJS
OUTPUT_FILE=../oas-js/oas.js
rm -rf $OUTPUT_FILE

touch $OUTPUT_FILE

echo "/* eslint-disable */\n" >> $OUTPUT_FILE
cat target/scala-2.12/oas-opt.js >> $OUTPUT_FILE

echo "domain logic written to $OUTPUT_FILE"