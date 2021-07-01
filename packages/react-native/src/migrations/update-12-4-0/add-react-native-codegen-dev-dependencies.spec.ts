import { readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { reactNativeCodegenVersion } from '../../utils/versions';
import update from './add-react-native-codegen-dev-dependencies';

describe('Add react-native-codegen to dev dependencies 12.4.0', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`should update libs if dependencies contain react-native`, async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        dependencies: { 'react-native': '*' },
        devDependencies: {},
      })
    );

    await update(tree);

    expect(
      readJson(tree, 'package.json').devDependencies['react-native-codegen']
    ).toEqual(reactNativeCodegenVersion);
  });

  it(`should not update libs if dependencies do not contain react-native`, async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        dependencies: {},
        devDependencies: {},
      })
    );

    await update(tree);

    expect(
      readJson(tree, 'package.json').devDependencies['react-native-codegen']
    ).toEqual(undefined);
  });
});
