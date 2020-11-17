import {
  Rule,
  SchematicContext,
  TaskConfiguration,
  TaskConfigurationGenerator,
  TaskExecutorFactory,
  Tree,
} from '@angular-devkit/schematics';
import { Observable, of } from 'rxjs';
import { spawn } from 'child_process';
import * as os from 'os';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function podInstallTask(cwd: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!context.engine.workflow) return;
    const engineHost = (context.engine.workflow as any)._engineHost;
    engineHost.registerTaskExecutor(createRunPodInstallTask());
    const packageInstall = context.addTask(new NodePackageInstallTask());
    context.addTask(new RunPodInstallTask(cwd), [packageInstall]);
  };
}

interface PodInstallTaskOptions {
  cwd: string;
}

class RunPodInstallTask
  implements TaskConfigurationGenerator<PodInstallTaskOptions> {
  constructor(private cwd: string) {}

  toConfiguration(): TaskConfiguration<PodInstallTaskOptions> {
    return {
      name: 'RunPodInstall',
      options: {
        cwd: this.cwd,
      },
    };
  }
}

const podInstallErrorMessage = `Running \`pod install\` failed, see above.\nDo you have CocoaPods (https://cocoapods.org/) installed?`;

export function podInstall(iosRoot: string) {
  return new Observable<void>((obs) => {
    const process = spawn('pod', ['install'], {
      cwd: iosRoot,
      stdio: [0, 1, 2],
    });

    process.on('close', (code: number) => {
      if (code === 0) {
        obs.next();
        obs.complete();
      } else {
        obs.error(new Error(podInstallErrorMessage));
        obs.complete();
      }
    });

    process.on('error', () => {
      obs.error(new Error(podInstallErrorMessage));
      obs.complete();
    });
  });
}

function createRunPodInstallTask(): TaskExecutorFactory<PodInstallTaskOptions> {
  return {
    name: 'RunPodInstall',
    create: () => {
      return Promise.resolve(
        (options: PodInstallTaskOptions, context: SchematicContext) => {
          if (os.platform() !== 'darwin') {
            context.logger.info(
              'Skipping `pod install` on non-darwin platform'
            );
            return of();
          }

          context.logger.info(`Running \`pod install\` from "${options.cwd}"`);

          return podInstall(options.cwd);
        }
      );
    },
  };
}
