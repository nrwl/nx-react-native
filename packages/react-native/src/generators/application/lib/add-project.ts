import {
  addProjectConfiguration,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
  readWorkspaceConfiguration,
  TargetConfiguration,
  Tree,
  updateWorkspaceConfiguration,
} from '@nrwl/devkit';
import { NormalizedSchema } from './normalize-options';

export function addProject(host: Tree, options: NormalizedSchema) {
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

  const workspace = readWorkspaceConfiguration(host);

  if (!workspace.defaultProject) {
    workspace.defaultProject = options.projectName;

    updateWorkspaceConfiguration(host, workspace);
  }
}

function getTargets(options: NormalizedSchema) {
  const architect: { [key: string]: TargetConfiguration } = {};

  architect.start = {
    executor: '@nrwl/react-native:start',
    options: {
      port: 8081,
    },
  };

  architect.serve = {
    executor: '@nrwl/workspace:run-commands',
    options: {
      command: `nx start ${options.name}`,
    },
  };

  architect['run-ios'] = {
    executor: '@nrwl/react-native:run-ios',
    options: {},
  };

  architect['bundle-ios'] = {
    executor: '@nrwl/react-native:bundle',
    outputs: [`${options.appProjectRoot}/build`],
    options: {
      entryFile: `${options.appProjectRoot}/src/main.tsx`,
      platform: 'ios',
      bundleOutput: `dist/${options.appProjectRoot}/ios/main.bundle`,
    },
  };

  architect['run-android'] = {
    executor: '@nrwl/react-native:run-android',
    options: {},
  };

  architect['build-android'] = {
    executor: '@nrwl/react-native:build-android',
    outputs: [
      `${options.appProjectRoot}/android/app/build/outputs/bundle`,
      `${options.appProjectRoot}/android/app/build/outputs/apk`,
    ],
    options: {},
  };

  architect['bundle-android'] = {
    executor: '@nrwl/react-native:bundle',
    options: {
      entryFile: `${options.appProjectRoot}/src/main.tsx`,
      platform: 'android',
      bundleOutput: `dist/${options.appProjectRoot}/android/main.bundle`,
    },
  };

  architect['sync-deps'] = {
    executor: '@nrwl/react-native:sync-deps',
    options: {},
  };

  return architect;
}
