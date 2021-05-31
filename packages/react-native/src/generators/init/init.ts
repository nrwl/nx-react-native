import { setDefaultCollection } from '@nrwl/workspace/src/utilities/set-default-collection';
import {
  addDependenciesToPackageJson,
  convertNxGenerator,
  formatFiles,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { Schema } from './schema';
import {
  jestReactNativeVersion,
  metroReactNativeBabelPresetVersion,
  metroVersion,
  nxVersion,
  reactNativeCommunityCli,
  reactNativeCommunityCliAndroid,
  reactNativeCommunityCliIos,
  reactNativeVersion,
  reactTestRendererVersion,
  reactVersion,
  testingLibraryJestNativeVersion,
  testingLibraryReactNativeVersion,
  typesReactNativeVersion,
  typesReactVersion,
} from '../../utils/versions';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { addGitIgnoreEntry } from './lib/add-git-ignore-entry';
import { jestInitGenerator } from '@nrwl/jest';

export async function reactNativeInitGenerator(host: Tree, schema: Schema) {
  setDefaultCollection(host, '@nrwl/react-native');
  addGitIgnoreEntry(host);

  const tasks = [updateDependencies(host)];

  if (!schema.unitTestRunner || schema.unitTestRunner === 'jest') {
    const jestTask = jestInitGenerator(host, {});
    tasks.push(jestTask);
  }

  if (!schema.skipFormat) {
    await formatFiles(host);
  }

  return runTasksInSerial(...tasks);
}

export function updateDependencies(host: Tree) {
  moveDependency(host);

  return addDependenciesToPackageJson(
    host,
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
      '@react-native-community/cli': reactNativeCommunityCli,
      '@react-native-community/cli-platform-android': reactNativeCommunityCliAndroid,
      '@react-native-community/cli-platform-ios': reactNativeCommunityCliIos,
      'metro-react-native-babel-preset': metroReactNativeBabelPresetVersion,
      '@testing-library/react-native': testingLibraryReactNativeVersion,
      '@testing-library/jest-native': testingLibraryJestNativeVersion,
      'jest-react-native': jestReactNativeVersion,
      metro: metroVersion,
      'metro-resolver': metroVersion,
      'react-test-renderer': reactTestRendererVersion,
    }
  );
}

function moveDependency(host: Tree) {
  updateJson(host, 'package.json', (json) => {
    json.dependencies = json.dependencies || {};

    delete json.dependencies['@nrwl/react'];
    return json;
  });
}

export default reactNativeInitGenerator;
export const reactNativeInitSchematic = convertNxGenerator(
  reactNativeInitGenerator
);
