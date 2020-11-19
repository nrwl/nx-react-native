import { ReactNativeStartOptions } from '../schema';
import { fork } from 'child_process';
import { join } from 'path';

export function startAsync(
  workspaceRoot: string,
  projectRoot: string,
  options: ReactNativeStartOptions
): Promise<number> {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, './node_modules/react-native/cli.js'),
      ['start', ...createStartOptions(options)],
      { cwd: projectRoot }
    );
    cp.on('error', (err) => {
      reject(err);
    });
    cp.on('exit', (code) => {
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
