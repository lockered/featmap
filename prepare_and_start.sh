#!/bin/bash
scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
cd "$scriptDir"

echo "$scriptDir"

echo "build webapp"
./build/complete_build.sh

echo "copy executable"
cp ./bin/featmap--linux-amd64 ./featmap

echo "start featmap"
./featmap
