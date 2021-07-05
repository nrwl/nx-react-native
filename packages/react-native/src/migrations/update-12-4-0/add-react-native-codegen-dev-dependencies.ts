import {
  addDependenciesToPackageJson,
  Tree,
  formatFiles,
  readJson,
} from '@nrwl/devkit';
import { reactNativeCodegenVersion } from '../../utils/versions';

/**
 * Add react-native-codegen due to react-native upgrade.
 * https://react-native-community.github.io/upgrade-helper/?from=0.64.1&to=0.65.0-rc.2
 */
export default async function update(tree: Tree) {
  const packagesJson = readJson(tree, 'package.json');
  const packages = Object.keys({
    ...packagesJson.dependencies,
    ...packagesJson.devDependencies,
  });

  if (!packages.includes('react-native')) {
    return;
  }

  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      'react-native-codegen': reactNativeCodegenVersion,
    }
  );
  await formatFiles(tree);

  return installTask;
}
