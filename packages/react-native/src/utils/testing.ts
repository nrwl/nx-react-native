import { schema } from '@angular-devkit/core';
import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { join } from 'path';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { Rule, Tree } from '@angular-devkit/schematics';
import { names } from '@nrwl/workspace/src/utils/name-utils';
import { updateWorkspace } from '@nrwl/workspace/src/utils/workspace';
import { MockBuilderContext } from '@nrwl/workspace/testing';

const testRunner = new SchematicTestRunner(
  '@nrwl/react-native',
  join(__dirname, '../../collection.json')
);

export function runSchematic<SchemaOptions = any>(
  schematicName: string,
  options: SchemaOptions,
  tree: Tree
) {
  return testRunner.runSchematicAsync(schematicName, options, tree).toPromise();
}

export function callRule(rule: Rule, tree: Tree) {
  return testRunner.callRule(rule, tree).toPromise();
}

export function createApp(tree: Tree, appName: string): Promise<Tree> {
  const { fileName } = names(appName);

  return callRule(
    updateWorkspace((workspace) => {
      workspace.projects.add({
        name: fileName,
        root: `apps/${fileName}`,
        projectType: 'application',
        sourceRoot: `apps/${fileName}/src`,
        targets: {},
      });
    }),
    tree
  );
}

export async function getTestArchitect() {
  const architectHost = new TestingArchitectHost('/root', '/root');
  const registry = new schema.CoreSchemaRegistry();
  registry.addPostTransform(schema.transforms.addUndefinedDefaults);

  const architect = new Architect(architectHost, registry);

  await architectHost.addBuilderFromPackage(join(__dirname, '../..'));

  return { architect, architectHost };
}

export async function getMockContext() {
  const { architect, architectHost } = await getTestArchitect();

  const context = new MockBuilderContext(architect, architectHost);
  await context.addBuilderFromPackage(join(__dirname, '../..'));
  return context;
}
