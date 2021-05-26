import {
  Tree,
  readWorkspaceConfiguration,
  getProjects,
  readJson,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { NxJson } from '@nrwl/workspace';
import { reactNativeApplicationGenerator } from './application';

describe('app', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should update workspace.json', async () => {
    await reactNativeApplicationGenerator(appTree, {
      name: 'myApp',
      displayName: 'myApp',
    });
    const workspaceJson = readWorkspaceConfiguration(appTree);
    const projects = getProjects(appTree);

    expect(projects.get('my-app').root).toEqual('apps/my-app');
    expect(workspaceJson.defaultProject).toEqual('my-app');
  });

  it('should update nx.json', async () => {
    await reactNativeApplicationGenerator(appTree, {
      name: 'myApp',
      displayName: 'myApp',
      tags: 'one,two',
    });

    const nxJson = readJson<NxJson>(appTree, '/nx.json');
    expect(nxJson).toMatchObject({
      npmScope: 'proj',
      projects: {
        'my-app': {
          tags: ['one', 'two'],
        },
      },
    });
  });

  it('should generate files', async () => {
    await reactNativeApplicationGenerator(appTree, {
      name: 'myApp',
      displayName: 'myApp',
    });
    expect(appTree.exists('apps/my-app/src/app/App.tsx')).toBeTruthy();
    expect(appTree.exists('apps/my-app/src/main.tsx')).toBeTruthy();

    const tsconfig = readJson(appTree, 'apps/my-app/tsconfig.json');
    expect(tsconfig.extends).toEqual('../../tsconfig.base.json');

    expect(appTree.exists('apps/my-app/.eslintrc.json')).toBe(true);
  });
});
