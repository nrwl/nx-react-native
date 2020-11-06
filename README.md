# React Native Plugin for Nx

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-react.png" width="600"></p>

<div align="center">

[![License](https://img.shields.io/npm/l/@nrwl/workspace.svg?style=flat-square)]()
[![NPM Version](https://badge.fury.io/js/%40nrwl%2Freact-native.svg)](https://www.npmjs.com/@nrwl/react-native)
[![Join the chat at https://gitter.im/nrwl-nx/community](https://badges.gitter.im/nrwl-nx/community.svg)](https://gitter.im/nrwl-nx/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join us @nrwl/community on slack](https://img.shields.io/badge/slack-%40nrwl%2Fcommunity-brightgreen)](https://join.slack.com/t/nrwlcommunity/shared_invite/enQtNzU5MTE4OTQwOTk0LTgxY2E0ZWYzMWE0YzA5ZDA2MWM1NDVhNmI2ZWMyYmZhNWJiODk3MjkxZjY3MzU5ZjRmM2NmNWU1OTgyZmE4Mzc)

</div>


## Getting started

### Create a new Nx workspace:

```
npx create-nx-workspace --cli=nx --preset=empty
```

### Install React Native plugin

```
# Using npm
npm install --save-dev @nrwl/react-native

# Using yarn
yarn -D @nrwl/react-native
```

### Create an app


```
npx nx g @nrwl/react-native:app <app-name>
```

When using Nx, you can create multiple applications and themes in the same workspace. If you don't want to prefix your commands with npx, install `@nrwl/cli` globally.


### Start the bundler

```
npx nx start <app-name> 
```

### Run on devices

Android:

```
npx nx run-android <app-name>
```

iOS:

```
npx nx run-ios <app-name>
```

### Release build

Android:

```
npx nx build-android <app-name>
```

iOS:

No CLI support yet. Run in the Xcode project. See: https://reactnative.dev/docs/running-on-device

### Test/lint the app

```
npx nx test <app-name>
npx nx lint <app-name>
```

## Using components from React library

You can use a component from React library generated using Nx package for React. Once you run:

```
npx nx g @nrwl/react-native:lib ui-button
```

This will generate the `UiButton` component, which you can use in your app.

```jsx
import { UiButton } from '@myorg/ui-button';
```

## Contributing

Running unit tests:

```
yarn test
```

Running e2e tests:

```
# This will generate a test workspace at 'tmp/nx-e2e/proj'
# You can use this workspace to test manually
yarn e2e
```

Building:

```
yarn build
```

## Learn more

Visit the [Nx Documentation](https://nx.dev) to learn more.
