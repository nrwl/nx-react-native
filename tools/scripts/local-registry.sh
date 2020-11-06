#!/usr/bin/env bash

COMMAND=$1

if [[ $COMMAND == "enable" ]]; then
	echo "Setting registry to local registry"
	echo "To Disable: yarn local-registry disable"
	npm config set registry http://localhost:4873/
	yarn config set registry http://localhost:4873/
	exit 0
fi

if [[ $COMMAND == "disable" ]]; then
	npm config delete registry
	yarn config delete registry
	CURRENT_NPM_REGISTRY=`npm config get registry`
	CURRENT_YARN_REGISTRY=`yarn config get registry`

	echo "Reverting registries"
	echo "  > NPM:  $CURRENT_NPM_REGISTRY"
	echo "  > YARN: $CURRENT_YARN_REIGSTRY"
	exit 0
fi

echo "Command not supported: $COMMAND"
exit 1
