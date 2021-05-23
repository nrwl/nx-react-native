import * as chalk from 'chalk';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { ReactNativeStartOptions } from './schema';
import { ExecutorContext, logger } from '@nrwl/devkit';
import { isPackagerRunning } from './lib/is-packager-running';
import { ChildProcess, fork } from 'child_process';
import { join } from 'path';

export interface ReactNativeStartOutput {
  baseUrl?: string;
  success: boolean;
}

let childProcess: ChildProcess;

export default async function* startExecutor(
  options: ReactNativeStartOptions,
  context: ExecutorContext
) {
  const projectRoot = context.workspace.projects[context.projectName].root;
  ensureNodeModulesSymlink(context.root, projectRoot);

  await runCliStart(context.root, projectRoot, options);

  const baseUrl = `http://localhost:${options.port}`;
  const appName = context.target;
  logger.info(chalk.cyan(`Packager is ready at ${baseUrl}`));
  logger.info(
    `Use ${chalk.bold(`nx run-android ${appName}`)} or ${chalk.bold(
      `nx run-ios ${appName}`
    )} to run the native app.`
  );
  yield {
    baseUrl,
    success: true,
  };

  // This Promise intentionally never resolves, leaving the process running
  await new Promise(() => {});
}

/*
 * Starts the JS bundler and checks for "running" status before notifying
 * that packager has started.
 */
export function runCliStart(
  workspaceRoot: string,
  projectRoot: string,
  options: ReactNativeStartOptions
) {
  return isPackagerRunning(options.port)
    .then((status) => {
      if (status === 'running') return;
      return startAsync(workspaceRoot, projectRoot, options);
    })
    .then(() => {
      // Check every second (up to 30 times) to see if the packager is running
      let count = 0;
      const check = setInterval(() => {
        isPackagerRunning(options.port).then((status) => {
          console.log('start', 'count', count, 'status', status);
          if (count === 30) clearInterval(check); // if it is 30 times, stop checking
          if (status != 'running') {
            // if it is not running
            clearInterval(check);
            if (childProcess) {
              childProcess.kill();
            }
          } else {
            count++;
          }
        });
      }, 1000);
    });
}

export function startAsync(
  workspaceRoot: string,
  projectRoot: string,
  options: ReactNativeStartOptions
): Promise<number> {
  return new Promise((resolve, reject) => {
    childProcess = fork(
      join(workspaceRoot, './node_modules/react-native/cli.js'),
      ['start', ...createStartOptions(options)],
      { cwd: projectRoot }
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

function createStartOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (k === 'resetCache') {
      acc.push(`--reset-cache`);
    } else {
      acc.push(`--${k}`, options[k]);
    }
    return acc;
  }, []);
}
