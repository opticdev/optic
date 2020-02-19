#!/bin/bash
rm -rf build && mkdir build
sbt "opticJVM/generateTypescript"
sbt "opticJVM/test:runMain com.useoptic.types.AvroMappings"
sbt publishLocal

OUTPUT_DIRECTORY=../workspaces/domain/src/domain-types
cp -r ./build/ $OUTPUT_DIRECTORY
