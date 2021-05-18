import {
  addProjectConfiguration,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
} from '@nrwl/devkit';
import { NormalizedSchema } from './normalize-options';

export function addProject(host, options: NormalizedSchema) {
  const nxConfig: NxJsonProjectConfiguration = {
    tags: options.parsedTags,
  };

  const project: ProjectConfiguration = {
    root: options.appProjectRoot,
    sourceRoot: `${options.appProjectRoot}/src`,
    projectType: 'application',
    targets: { ...getTargets(options) },
  };

  addProjectConfiguration(host, options.projectName, {
    ...project,
    ...nxConfig,
  });
}

function getTargets(options: NormalizedSchema) {
  const architect: { [key: string]: any } = {};

  architect.start = {
    builder: '@nrwl/react-native:start',
    options: {
      port: 8081,
    },
  };

  architect.serve = {
    builder: '@nrwl/workspace:run-commands',
    options: {
      command: `nx start ${options.name}`,
    },
  };

  architect['run-ios'] = {
    builder: '@nrwl/react-native:run-ios',
    options: {},
  };

  architect['bundle-ios'] = {
    builder: '@nrwl/react-native:bundle',
    outputs: [`${options.appProjectRoot}/build`],
    options: {
      entryFile: `${options.appProjectRoot}/src/main.tsx`,
      platform: 'ios',
      bundleOutput: `dist/${options.appProjectRoot}/ios/main.bundle`,
    },
  };

  architect['run-android'] = {
    builder: '@nrwl/react-native:run-android',
    options: {},
  };

  architect['build-android'] = {
    builder: '@nrwl/react-native:build-android',
    outputs: [
      `${options.appProjectRoot}/android/app/build/outputs/bundle`,
      `${options.appProjectRoot}/android/app/build/outputs/apk`,
    ],
    options: {},
  };

  architect['bundle-android'] = {
    builder: '@nrwl/react-native:bundle',
    options: {
      entryFile: `${options.appProjectRoot}/src/main.tsx`,
      platform: 'android',
      bundleOutput: `dist/${options.appProjectRoot}/android/main.bundle`,
    },
  };

  architect['sync-deps'] = {
    builder: '@nrwl/react-native:sync-deps',
    options: {},
  };

  return architect;
}
