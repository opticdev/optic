#!/usr/bin/env bash
sbt project clean compile assembly
output='server/target/scala-2.12/server-assembly.jar'

echo $output

dest='cli/jars/server-assembly.jar'

echo $dest

yes | cp -rf $output $dest