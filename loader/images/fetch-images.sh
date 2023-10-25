#!/usr/bin/env bash

set -euo pipefail

dir=$(dirname "$(realpath "$0")")/nasa

if [[ -f "$dir/README.md" ]]
then
    echo >&2 "images appear to have already been fetched! \`rm -r $dir\` to reset and run again."
    exit 1
fi

submodule_status=$(git submodule status --cached "$dir")
submodule_hash=${submodule_status:1:40}

echo "fetching $submodule_hash"
curl -L https://github.com/kevingessner/luna-images/archive/$submodule_hash.tar.gz | tar -xzf "-" --directory "$dir" --strip-components 1
