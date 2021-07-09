import { join } from 'path';
import {
  ensureNxProject,
  patchPackageJsonForPlugin,
  runPackageManagerInstall,
} from '@nrwl/nx-plugin/testing';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';
import { readJsonFile, writeJsonFile } from '@nrwl/devkit';

beforeAll(() => {
  // delete @nrlw/detox form react-native package.json so it will not pull @nrwl/detox from npm registry and use local one
  const path = join(appRootPath, 'dist/packages/react-native/package.json');
  const json = readJsonFile(path);
  delete json.dependencies['@nrwl/detox'];
  writeJsonFile(path, json);
});

beforeEach(() => {
  ensureNxProject('@nrwl/detox', 'dist/packages/detox');
  patchPackageJsonForPlugin('@nrwl/react-native', 'dist/packages/react-native');
  runPackageManagerInstall();
});
