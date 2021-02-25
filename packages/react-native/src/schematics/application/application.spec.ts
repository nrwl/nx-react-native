import { Tree } from '@angular-devkit/schematics';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import * as stripJsonComments from 'strip-json-comments';
import { NxJson, readJsonInTree } from '@nrwl/workspace';
import { runSchematic } from '../../utils/testing';

describe('app', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createEmptyWorkspace(appTree);
  });

  it('should update workspace.json', async () => {
    const tree = await runSchematic('app', { name: 'myApp' }, appTree);
    const workspaceJson = readJsonInTree(tree, '/workspace.json');

    expect(workspaceJson.projects['my-app'].root).toEqual('apps/my-app');
    expect(workspaceJson.defaultProject).toEqual('my-app');
  });

  it('should update nx.json', async () => {
    const tree = await runSchematic(
      'app',
      { name: 'myApp', tags: 'one,two' },
      appTree
    );
    const nxJson = readJsonInTree<NxJson>(tree, '/nx.json');
    expect(nxJson).toMatchObject({
      npmScope: 'proj',
      projects: {
        'my-app': {
          tags: ['one', 'two']
        }
      }
    });
  });

  it('should generate files', async () => {
    const tree = await runSchematic('app', { name: 'myApp' }, appTree);
    expect(tree.exists('apps/my-app/src/app/App.tsx')).toBeTruthy();
    expect(tree.exists('apps/my-app/src/main.tsx')).toBeTruthy();

    const tsconfig = readJsonInTree(tree, 'apps/my-app/tsconfig.json');
    expect(tsconfig.extends).toEqual('../../tsconfig.base.json');

    expect(tree.exists('apps/my-app/.eslintrc.json')).toBe(true)
  });
});
