import { ExecutorContext } from '@nrwl/devkit';
import { join } from 'path';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { ChildProcess, spawn } from 'child_process';
import { chmodSync } from 'fs';
import { ReactNativeBuildOptions } from './schema';
export interface ReactNativeBuildOutput {
  success: boolean;
}

let childProcess: ChildProcess;

export default async function* buildAndroidExecutor(
  options: ReactNativeBuildOptions,
  context: ExecutorContext
): AsyncGenerator<ReactNativeBuildOutput> {
  const projectRoot = context.workspace.projects[context.projectName].root;
  ensureNodeModulesSymlink(context.root, projectRoot);
  chmodSync(join(projectRoot, 'android', 'gradlew'), 0o775);
  chmodSync(join(projectRoot, 'android', 'gradlew.bat'), 0o775);

  try {
    await runCliBuild(projectRoot, options);
    yield { success: true };
  } finally {
    if (childProcess) {
      childProcess.kill();
    }
  }
}

function runCliBuild(projectRoot: string, options: ReactNativeBuildOptions) {
  return new Promise((resolve, reject) => {
    childProcess = spawn(
      process.platform === 'win32' ? 'gradlew.bat' : './gradlew',
      [options.apk ? 'assembleRelease' : 'bundleRelease'],
      {
        cwd: join(projectRoot, 'android'),
        stdio: [0, 1, 2],
      }
    );

    // Ensure the child process is killed when the parent exits
    process.on('exit', () => childProcess.kill());
    process.on('SIGTERM', () => childProcess.kill());

    childProcess.on('error', (err) => {
      reject(err);
    });
    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}
