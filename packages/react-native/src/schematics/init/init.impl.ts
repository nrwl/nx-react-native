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

export default function (schema: Schema) {
  return chain([
    setWorkspaceDefaults(),
    addPackageWithInit('@nrwl/jest'),
    addDependencies(),
    updateGitIgnore(),
    moveDependency(),
  ]);
}

const gitIgnoreEntriesForReactNative = `
# React Native

## Xcode

**/ios/**/build/
**/ios/**/*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate

## Android

**/android/**/build/
**/android/**/.gradle
**/android/**/local.properties
**/android/**/*.iml

## BUCK

buck-out/
\\.buckd/
*.keystore
!debug.keystore

## fastlane
#
# It is recommended to not store the screenshots in the git repo. Instead, use fastlane to re-generate the
# screenshots whenever they are needed.
# For more information about the recommended setup visit:
# https://docs.fastlane.tools/best-practices/source-control/
#
*/fastlane/report.xml
*/fastlane/Preview.html
*/fastlane/screenshots

## Bundle artifact
*.jsbundle

## CocoaPods
**/ios/Pods/
`;

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

    const ig = ignore();
    ig.add(host.read('.gitignore').toString());

    if (!ig.ignores('apps/example/ios/Pods/Folly')) {
      host.overwrite(
        '.gitignore',
        `${host
          .read('.gitignore')!
          .toString('utf-8')
          .trimRight()}\n${gitIgnoreEntriesForReactNative}/\n`
      );
    }
  };
}
