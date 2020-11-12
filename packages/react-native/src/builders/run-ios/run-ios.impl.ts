import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { join } from 'path';
import { getProjectRoot } from '../../utils/get-project-root';
import { fork } from 'child_process';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { platform } from 'os';

export interface ReactNativeRunIOsOptions extends JsonObject {
  configuration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
}

export interface ReactNativeRunIOsOutput {
  success: boolean;
}

export default createBuilder<ReactNativeRunIOsOptions>(run);

function run(
  options: ReactNativeRunIOsOptions,
  context: BuilderContext
): Observable<ReactNativeRunIOsOutput> {
  if (platform() !== 'darwin') {
    throw new Error(`The run-ios build requires OSX to run`);
  }
  return from(getProjectRoot(context)).pipe(
    tap((root) => ensureNodeModulesSymlink(context.workspaceRoot, root)),
    switchMap((root) =>
      from(runCliRunIOS(context.workspaceRoot, root, options))
    ),
    map(() => {
      return {
        success: true,
      };
    })
  );
}

function runCliRunIOS(workspaceRoot, projectRoot, options) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, './node_modules/react-native/cli.js'),
      ['run-ios', ...createRunIOSOptions(options)],
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

function createRunIOSOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (options[k]) acc.push(`--${k}`, options[k]);
    return acc;
  }, []);
}
