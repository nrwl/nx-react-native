import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { getProjectRoot } from '../../utils/get-project-root';
import { join } from 'path';
import { findAllNpmDependencies } from '../../utils/find-all-npm-dependencies';
import { createProjectGraph } from '@nrwl/workspace/src/core/project-graph';
import { readJsonFile } from '@nrwl/workspace';
import { writeJsonFile } from '@nrwl/workspace/src/utils/fileutils';
import * as chalk from 'chalk';

export interface ReactNativeDevServerOptions extends JsonObject {
  host: string;
  port: number;
  resetCache: boolean;
}

export interface ReactNativeggSyncDepsOutput {
  success: boolean;
}

export function syncDeps(projectName: string, projectRoot: string): string[] {
  const graph = createProjectGraph();
  const npmDeps = findAllNpmDependencies(graph, projectName);
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = readJsonFile(packageJsonPath);
  const newDeps = [];
  let updated = false;

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
    updated = true;
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
  deps: string[],
  context: BuilderContext
) {
  if (deps.length > 0) {
    context.logger.info(`${chalk.bold.cyan(
      'info'
    )} Added entries to 'package.json' for '${projectName}' (for autolink):
  ${deps.map((d) => chalk.bold.cyan(`"${d}": "*"`)).join('\n  ')}`);
  } else {
    context.logger.info(
      `${chalk.bold.cyan(
        'info'
      )} Dependencies for '${projectName}' are up to date! No changes made.`
    );
  }
}

export default createBuilder<ReactNativeDevServerOptions>(run);

function run(
  options: ReactNativeDevServerOptions,
  context: BuilderContext
): Observable<ReactNativeggSyncDepsOutput> {
  return from(getProjectRoot(context)).pipe(
    tap((root) =>
      displayNewlyAddedDepsMessage(
        context.target.project,
        syncDeps(context.target.project, root),
        context
      )
    ),
    map(() => ({ success: true }))
  );
}
