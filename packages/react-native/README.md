# React Native Plugin for Nx

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-react.png" width="600"></p>

<div align="center">

[![License](https://img.shields.io/npm/l/@nrwl/workspace.svg?style=flat-square)]()
[![NPM Version](https://badge.fury.io/js/%40nrwl%2Freact-native.svg)](https://www.npmjs.com/@nrwl/react-native)
[![Join the chat at https://gitter.im/nrwl-nx/community](https://badges.gitter.im/nrwl-nx/community.svg)](https://gitter.im/nrwl-nx/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join us @nrwl/community on slack](https://img.shields.io/badge/slack-%40nrwl%2Fcommunity-brightgreen)](https://join.slack.com/t/nrwlcommunity/shared_invite/enQtNzU5MTE4OTQwOTk0LTgxY2E0ZWYzMWE0YzA5ZDA2MWM1NDVhNmI2ZWMyYmZhNWJiODk3MjkxZjY3MzU5ZjRmM2NmNWU1OTgyZmE4Mzc)

</div>

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Getting started](#getting-started)
  - [Create a new Nx workspace:](#create-a-new-nx-workspace)
  - [Install React Native plugin](#install-react-native-plugin)
  - [Create an app](#create-an-app)
  - [Start the JavaScript bundler](#start-the-javascript-bundler)
  - [Run on devices](#run-on-devices)
  - [Release build](#release-build)
  - [Test/lint the app](#testlint-the-app)
- [Using components from React library](#using-components-from-react-library)
- [CLI Commands and Options](#cli-commands-and-options)
  - [`start`](#start)
    - [`--port [number]`](#--port-number)
  - [`run-ios`](#run-ios)
    - [`--port [number]`](#--port-number-1)
    - [`--install`](#--install)
    - [`--sync`](#--sync)
  - [`run-android`](#run-android)
    - [`--port [number]`](#--port-number-2)
    - [`--sync`](#--sync-1)
  - [`sync-deps`](#sync-deps)
- [Learn more](#learn-more)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started

### Create a new Nx workspace:

```sh
npx create-nx-workspace --cli=nx --preset=empty
```

### Install React Native plugin

```sh
# Using npm
npm install --save-dev @nrwl/react-native

# Using yarn
yarn add -D @nrwl/react-native
```

### Create an app

```sh
npx nx g @nrwl/react-native:app <app-name>
```

When using Nx, you can create multiple applications and themes in the same workspace. If you don't want to prefix your commands with npx, install `@nrwl/cli` globally.

### Start the JavaScript bundler

```sh
npx nx start <app-name>
```

This will start the bundler at `http://localhost:8081`.

### Run on devices

Make sure the bundler server is running.

**Android:**

```sh
npx nx run-android <app-name>
```

**iOS:** (Mac only)

```sh
npx nx run-ios <app-name> --install
```

Note: The `--install` flag installs Xcode dependencies before building the iOS app. This option keeps dependencies up to date.

### Release build

**Android:**

```sh
npx nx build-android <app-name>
```

**iOS:** (Mac only)

No CLI support yet. Run in the Xcode project. See: https://reactnative.dev/docs/running-on-device

### Test/lint the app

```sh
npx nx test <app-name>
npx nx lint <app-name>
```

## Using components from React library

You can use a component from React library generated using Nx package for React. Once you run:

```sh
npx nx g @nrwl/react-native:lib ui-button
```

This will generate the `UiButton` component, which you can use in your app.

```jsx
import { UiButton } from '@myorg/ui-button';
```

## CLI Commands and Options

Usage:

```sh
npx nx [command] [app] [...options]
```

### `start`

Starts the JS bundler that communicates with connected devices.

#### `--port [number]`

The port to listen on.

### `run-ios`

Builds your app and starts it on iOS simulator.

#### `--port [number]`

The port of the JS bundler.

#### `--install`

Install dependencies for the Xcode project before building iOS app.

#### `--sync`

Sync app dependencies to its `package.json`. On by default, use `--no-sync` to turn it off.

### `run-android`

Builds your app and starts it on iOS simulator.

#### `--port [number]`

The port of the JS bundler.

#### `--sync`

Sync app dependencies to its `package.json`. On by default, use `--no-sync` to turn it off.

### `sync-deps`

Sync app dependencies to its `package.json`.

#### `--include [string]`

A comma-separate list of additional packages to include.

e.g. `nx sync-deps [app] --include react-native-gesture,react-native-safe-area-context`

## Learn more

Visit the [Nx Documentation](https://nx.dev) to learn more.

## Contributing

To publish packages to a local registry, do the following:

- Download Nx main repo. In the nx main repo, run `yarn local-registry start` in Terminal 1 (keep it running)
- In the Nx main repo, run `yarn local-registry clear` in Terminal 2
- In the current NX-react-native repo, run `yarn local-registry enable` in Terminal 3
- Run `yarn build` in Terminal 3
- Run `yarn release 999.9.9 latest --local` in Terminal 3
- Run `cd /tmp` in Terminal 3
- Run `npx create-nx-workspace` in Terminal 3
