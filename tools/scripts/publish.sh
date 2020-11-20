#!/usr/bin/env bash

VERSION=$1
TAG=$2
LOCAL=$3

NPM_REGISTRY=`npm config get registry`

if [ "$TAG" = "--local" ]; then
  TAG="next"
  LOCAL="--local"
fi

echo "Publishing to registry:"

echo $NPM_REGISTRY

if [ "$LOCAL" = "--local" ]; then
  if [[ ! $NPM_REGISTRY == http://localhost* ]]; then
    echo "------------------"
    echo "💣 WARNING 💣 => $NPM_REGISTRY does not look like a local registry!"
    echo "You may want to set registry with 'npm config set registry ...'"
    echo "------------------"
    exit 1
  fi
fi

read -p "Continue? (y/n)" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 # handle exits from shell or function but don't exit interactive shell
fi

if [ "$LOCAL" = "--local" ]; then
  echo "Local Publish: Skipping Login"
else
  echo "Logging into npm"
  npm login
fi

nx run-many --target publish --all --parallel -- --args="--version=$VERSION --tag=$TAG"

if [ "$LOCAL" = "--local" ]; then
  echo "Published Locally"
else
  echo "Published to npm"
  npm logout
  echo "Logged out of npm"
fi
