import { chain, Rule } from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  updateJsonInTree,
  addPackageWithInit,
  updateWorkspace,
} from '@nrwl/workspace';
import { Schema } from './schema';
import {
  nxVersion,
  reactVersion,
  reactNativeVersion,
  typesReactVersion,
  typesReactNativeVersion,
  reactNativeCommunityCliPlatformIos,
  metroReactNativeBabelPresetVersion,
} from '../../utils/versions';
import { JsonObject } from '@angular-devkit/core';
import ignore from 'ignore';

export default function (schema: Schema) {
  return chain([
    setWorkspaceDefaults(),
    addPackageWithInit('@nrwl/jest'),
    addDependencies(),
    updateGitIgnore(),
    moveDependency(),
  ]);
}

export function addDependencies(): Rule {
  return addDepsToPackageJson(
    {
      react: reactVersion,
      'react-native': reactNativeVersion,
    },
    {
      '@nrwl/react': nxVersion,
      '@types/react': typesReactVersion,
      '@types/react-native': typesReactNativeVersion,
      '@react-native-community/cli-platform-ios': reactNativeCommunityCliPlatformIos,
      'metro-react-native-babel-preset': metroReactNativeBabelPresetVersion,
    }
  );
}

function moveDependency(): Rule {
  return updateJsonInTree('package.json', (json) => {
    json.dependencies = json.dependencies || {};

    delete json.dependencies['@nrwl/react'];
    return json;
  });
}

function setWorkspaceDefaults(): Rule {
  return updateWorkspace((workspace) => {
    workspace.extensions.cli = workspace.extensions.cli || {};
    const defaultCollection: string =
      workspace.extensions.cli &&
      ((workspace.extensions.cli as JsonObject).defaultCollection as string);

    if (!defaultCollection) {
      (workspace.extensions.cli as JsonObject).defaultCollection =
        '@nrwl/react-native';
    }
  });
}

function updateGitIgnore(): Rule {
  return (host) => {
    if (!host.exists('.gitignore')) {
      return;
    }

    const ig = ignore();
    ig.add(host.read('.gitignore').toString());

    if (!ig.ignores('apps/example/ios/Pods/Folly')) {
      const content = `${host
        .read('.gitignore')!
        .toString('utf-8')
        .trimRight()}\nPods/\n`;
      host.overwrite('.gitignore', content);
    }
  };
}
