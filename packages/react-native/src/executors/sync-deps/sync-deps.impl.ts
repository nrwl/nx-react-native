import { join } from 'path';
import { findAllNpmDependencies } from '../../utils/find-all-npm-dependencies';
import { createProjectGraph } from '@nrwl/workspace/src/core/project-graph';
import { readJsonFile } from '@nrwl/workspace';
import { writeJsonFile } from '@nrwl/workspace/src/utilities/fileutils';
import * as chalk from 'chalk';
import { ExecutorContext, logger } from '@nrwl/devkit';
import { ReactNativeSyncDepsOptions } from './schema';

export interface ReactNativeSyncDepsOutput {
  success: boolean;
}

export default async function* syncDepsExecutor(
  options: ReactNativeSyncDepsOptions,
  context: ExecutorContext
): AsyncGenerator<ReactNativeSyncDepsOutput> {
  const projectRoot = context.workspace.projects[context.projectName].root;
  displayNewlyAddedDepsMessage(
    context.projectName,
    syncDeps(context.projectName, projectRoot, options.include)
  );

  yield { success: true };
}

export function syncDeps(
  projectName: string,
  projectRoot: string,
  include?: string
): string[] {
  const graph = createProjectGraph();
  const npmDeps = findAllNpmDependencies(graph, projectName);
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = readJsonFile(packageJsonPath);
  const newDeps = [];
  const includeDeps = include?.split(',');
  let updated = false;

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
    updated = true;
  }

  if (includeDeps) {
    npmDeps.push(...includeDeps);
  }

  npmDeps.forEach((dep) => {
    if (!packageJson.dependencies[dep]) {
      packageJson.dependencies[dep] = '*';
      newDeps.push(dep);
      updated = true;
    }
  });

  if (updated) {
    writeJsonFile(packageJsonPath, packageJson);
  }

  return newDeps;
}

export function displayNewlyAddedDepsMessage(
  projectName: string,
  deps: string[]
) {
  if (deps.length > 0) {
    logger.info(`${chalk.bold.cyan(
      'info'
    )} Added entries to 'package.json' for '${projectName}' (for autolink):
  ${deps.map((d) => chalk.bold.cyan(`"${d}": "*"`)).join('\n  ')}`);
  } else {
    logger.info(
      `${chalk.bold.cyan(
        'info'
      )} Dependencies for '${projectName}' are up to date! No changes made.`
    );
  }
}
