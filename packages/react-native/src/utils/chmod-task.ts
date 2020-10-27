import {
  Rule,
  SchematicContext,
  TaskConfiguration,
  TaskConfigurationGenerator,
  TaskExecutorFactory,
  Tree,
} from '@angular-devkit/schematics';
import { of, throwError } from 'rxjs';
import { chmodSync } from 'fs';

let added = false;

export function chmodTask(file: string, mode: number | string): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!added) {
      const engineHost = (context.engine.workflow as any)._engineHost;
      engineHost.registerTaskExecutor(createRunChmodTask());
      added = true;
    }
    context.addTask(new RunChmodTask(file, mode), []);
  };
}

interface ChmodTaskOptions {
  file: string;
  mode: number | string;
}

class RunChmodTask implements TaskConfigurationGenerator<ChmodTaskOptions> {
  constructor(private file: string, private mode: number | string) {}

  toConfiguration(): TaskConfiguration<ChmodTaskOptions> {
    return {
      name: 'RunChmod',
      options: {
        mode: this.mode,
        file: this.file,
      },
    };
  }
}

function createRunChmodTask(): TaskExecutorFactory<ChmodTaskOptions> {
  return {
    name: 'RunChmod',
    create: () => {
      return Promise.resolve(
        (options: ChmodTaskOptions, context: SchematicContext) => {
          context.logger.info(`chmod ${options.mode} ${options.file}`);
          try {
            chmodSync(options.file, options.mode);
            return of();
          } catch {
            return throwError(new Error(`chmod failed for ${options.file}`));
          }
        }
      );
    },
  };
}
