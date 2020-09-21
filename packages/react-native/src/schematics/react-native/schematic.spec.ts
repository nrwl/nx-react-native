import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

import { ReactNativeSchematicSchema } from './schema';

describe('react-native schematic', () => {
  let appTree: Tree;
  const options: ReactNativeSchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@nrwl/react-native',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner.runSchematicAsync('react-native', options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
