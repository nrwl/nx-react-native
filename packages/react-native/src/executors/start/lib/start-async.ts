import { fork } from 'child_process';
import { join } from 'path';
import { ReactNativeStartOptions } from '../schema';

export function startAsync(
  workspaceRoot: string,
  projectRoot: string,
  options: ReactNativeStartOptions
): Promise<number> {
  return new Promise((resolve, reject) => {
    const childProcess = fork(
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
