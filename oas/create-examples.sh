#!/usr/bin/env bash
sbt "test:runMain com.seamless.oas.api_guru_interface.GenerateExampleCommands"
cp -r ./command-examples/ ./../webapp/public/example-commands/