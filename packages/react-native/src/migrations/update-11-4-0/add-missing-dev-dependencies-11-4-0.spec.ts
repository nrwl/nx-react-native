import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readJsonInTree } from '@nrwl/workspace';
import * as path from 'path';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import {
  metroVersion,
  reactNativeCommunityCli,
  reactNativeCommunityCliAndroid,
} from '../../utils/versions';

describe('Update 11.4.0', () => {
  let tree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(async () => {
    tree = Tree.empty();
    tree = createEmptyWorkspace(tree);
    schematicRunner = new SchematicTestRunner(
      '@nrwl/react-native',
      path.join(__dirname, '../../../migrations.json')
    );
  });

  it(`should update libs`, async () => {
    tree.overwrite(
      'package.json',
      JSON.stringify({
        dependencies: {},
        devDependencies: {},
      })
    );

    tree = await schematicRunner
      .runSchematicAsync('add-missing-dev-dependencies-11-4-0', {}, tree)
      .toPromise();

    const packageJson = readJsonInTree(tree, '/package.json');
    expect(packageJson).toMatchObject({
      dependencies: {},
      devDependencies: {
        metro: metroVersion,
        'metro-resolver': metroVersion,
        '@react-native-community/cli': reactNativeCommunityCli,
        '@react-native-community/cli-platform-android': reactNativeCommunityCliAndroid,
      },
    });
  });
});
