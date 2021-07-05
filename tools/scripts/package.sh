#!/usr/bin/env bash
##################################################
# This shell script is executed by nx-release.js #
##################################################

NX_VERSION=$1

if [[ $NX_VERSION == "--local" ]]; then
    NX_VERSION="*"
fi

rm -rf dist
npx nx run-many --target=build --all --parallel || { echo 'Build failed' ; exit 1; }

cd dist/packages

sed -i "" "s|exports.nxVersion = '\*';|exports.nxVersion = '$NX_VERSION';|g" react-native/src/utils/versions.js
