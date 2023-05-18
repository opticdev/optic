#!/usr/bin/env bash
set -eu

archive_dir="dist/archives"
checksums_file="${archive_dir}/checksums.txt"

# create the checksums file
for file in $(find dist/archives -maxdepth 1  -name '*.tar.gz'); do
  sha256sum "$file" >> "$checksums_file" 
done

# strip path components from a checksums file. given a file containing
# checkums in the format,
# > some-checksum some/file.tar.gz
# each line will be rewritten as,
# > some-checksum file.tar.gz
while IFS= read -r line; do
  IFS=' ' read -r checksum filepath <<< "$line"
  filename=$(basename "$filepath")
  echo "$checksum $filename" >> "$checksums_file".tmp
done < "$checksums_file"

mv "$checksums_file".tmp "$checksums_file"
