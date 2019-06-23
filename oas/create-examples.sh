#!/usr/bin/env bash
sbt "test:runMain com.seamless.oas.api_guru_interface.GenerateExampleCommands"
rm -rf ././../webapp/public/example-commands/
cp -r ./command-examples/ ./../webapp/public/example-commands/