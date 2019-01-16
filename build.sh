#!/usr/bin/env bash
sbt project clean compile assembly
output='proxy/target/scala-2.12/optic-proxy.jar'

echo $output

dest='cli/jars/optic-proxy.jar'

echo $dest

yes | cp -rf $output $dest