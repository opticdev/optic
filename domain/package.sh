#!/usr/bin/env bash
sbt fastOptJS
OUTPUT_FILE=/Users/aidancunniffe/Desktop/schema-builder/src/engine/domain.js
rm -rf $OUTPUT_FILE

touch $OUTPUT_FILE

echo "/* eslint-disable */\n" >> $OUTPUT_FILE
cat target/scala-2.12/seamless-ddd-fastopt.js >> $OUTPUT_FILE