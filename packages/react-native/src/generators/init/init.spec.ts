import { Tree, readJson, updateJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { reactNativeInitGenerator } from './init';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add react dependencies', async () => {
    await reactNativeInitGenerator(tree, {});
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies['@nrwl/react']).toBeUndefined();
    expect(packageJson.dependencies['react']).toBeDefined();
    expect(packageJson.dependencies['react-native']).toBeDefined();
    expect(packageJson.devDependencies['@nrwl/react']).toBeDefined();
    expect(packageJson.devDependencies['@types/react']).toBeDefined();
    expect(packageJson.devDependencies['@types/react-native']).toBeDefined();
  });

  it('should add .gitignore entries for React native files and directories', async () => {
    tree.write(
      '/.gitignore',
      `
/node_modules
`
    );
    await reactNativeInitGenerator(tree, {});

    const content = tree.read('/.gitignore').toString();

    expect(content).toMatch(/# React Native/);
    expect(content).toMatch(/# Nested node_modules/);
  });

  describe('defaultCollection', () => {
    it('should be set if none was set before', async () => {
      await reactNativeInitGenerator(tree, {});
      const workspaceJson = readJson(tree, 'workspace.json');
      expect(workspaceJson.cli.defaultCollection).toEqual('@nrwl/react-native');
    });

    it('should not be set if something else was set before', async () => {
      updateJson(tree, 'workspace.json', (json) => {
        json.cli = {
          defaultCollection: '@nrwl/react',
        };

        json.targets = {};

        return json;
      });
      await reactNativeInitGenerator(tree, {});
      const workspaceJson = readJson(tree, 'workspace.json');
      expect(workspaceJson.cli.defaultCollection).toEqual('@nrwl/react');
    });
  });
});
