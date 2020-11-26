import {
  Rule,
  SchematicContext,
  TaskConfiguration,
  TaskConfigurationGenerator,
  TaskExecutorFactory,
  Tree,
} from '@angular-devkit/schematics';
import { of, throwError } from 'rxjs';
import { ensureNodeModulesSymlink } from './ensure-node-modules-symlink';
import * as chalk from 'chalk';
import { appRootPath } from '@nrwl/workspace/src/utils/app-root';

let added = false;

export function symlinkTask(projectRoot: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!context.engine.workflow) return;
    if (!added) {
      const engineHost = (context.engine.workflow as any)._engineHost;
      engineHost.registerTaskExecutor(createRunSymlinkTask());
      added = true;
    }
    context.addTask(new RunSymlinkTask(appRootPath, projectRoot), []);
  };
}

interface SymlinkTaskOptions {
  workspaceRoot: string;
  projectRoot: string;
}

class RunSymlinkTask implements TaskConfigurationGenerator<SymlinkTaskOptions> {
  constructor(private workspaceRoot: string, private projectRoot: string) {}

  toConfiguration(): TaskConfiguration<SymlinkTaskOptions> {
    return {
      name: 'RunSymlink',
      options: {
        workspaceRoot: this.workspaceRoot,
        projectRoot: this.projectRoot,
      },
    };
  }
}

function createRunSymlinkTask(): TaskExecutorFactory<SymlinkTaskOptions> {
  return {
    name: 'RunSymlink',
    create: () => {
      return Promise.resolve(
        (options: SymlinkTaskOptions, context: SchematicContext) => {
          context.logger.info(
            `creating symlinks for ${chalk.bold(options.projectRoot)}`
          );
          try {
            ensureNodeModulesSymlink(
              options.workspaceRoot,
              options.projectRoot
            );
            return of();
          } catch {
            return throwError(
              new Error(
                `Failed to create symlinks for ${chalk.bold(
                  options.projectRoot
                )}`
              )
            );
          }
        }
      );
    },
  };
}
