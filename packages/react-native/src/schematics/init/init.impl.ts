import { chain, Rule } from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  addPackageWithInit,
  updateJsonInTree,
  updateWorkspace,
} from '@nrwl/workspace';
import { Schema } from './schema';
import {
  jestReactNativeVersion,
  metroReactNativeBabelPresetVersion,
  nxVersion,
  reactNativeCommunityCliPlatformIos,
  reactNativeVersion,
  reactTestRenderer,
  reactVersion,
  testingLibraryJestNativeVersion,
  testingLibraryReactNativeVersion,
  typesReactNativeVersion,
  typesReactVersion,
} from '../../utils/versions';
import { JsonObject } from '@angular-devkit/core';
import ignore from 'ignore';
import { gitIgnoreEntriesForReactNative } from './lib/gitignore-entries';

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
      '@nrwl/jest': nxVersion,
      '@nrwl/linter': nxVersion,
      '@types/react': typesReactVersion,
      '@types/react-native': typesReactNativeVersion,
      '@react-native-community/cli-platform-ios': reactNativeCommunityCliPlatformIos,
      'metro-react-native-babel-preset': metroReactNativeBabelPresetVersion,
      '@testing-library/react-native': testingLibraryReactNativeVersion,
      '@testing-library/jest-native': testingLibraryJestNativeVersion,
      'jest-react-native': jestReactNativeVersion,
      'react-test-renderer': reactTestRenderer,
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

    let content = host.read('.gitignore')!.toString('utf-8').trimRight();

    const ig = ignore();
    ig.add(host.read('.gitignore').toString());

    if (!ig.ignores('apps/example/ios/Pods/Folly')) {
      content = `${content}\n${gitIgnoreEntriesForReactNative}/\n`;
    }

    // also ignore nested node_modules folders due to symlink for React Native
    if (!ig.ignores('apps/example/node_modules')) {
      content = `${content}\n## Nested node_modules\n\nnode_modules/\n`;
    }

    host.overwrite('.gitignore', content);
  };
}
