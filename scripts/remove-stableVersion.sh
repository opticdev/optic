#!/bin/bash

# Remove `stableVersion` before releasing, as it's buggy.
# https://github.com/yarnpkg/berry/issues/3868
echo "$(jq 'del(.stableVersion)' package.json)" >package.json

for pkgjson in $(find projects/* -name package.json -depth 1); do
  echo $(jq 'del(.stableVersion)' $pkgjson) > $pkgjson
done
