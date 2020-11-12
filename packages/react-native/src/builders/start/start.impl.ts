import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { getProjectRoot } from '../../utils/get-project-root';
import { platform } from 'os';
import { fork } from 'child_process';
import { join } from 'path';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';

export interface ReactNativeDevServerOptions extends JsonObject {
  host: string;
  port: number;
  resetCache: boolean;
}

export interface ReactNativeDevServerBuildOutput {
  baseUrl: string;
  success: boolean;
}

export default createBuilder<ReactNativeDevServerOptions>(run);

function run(
  options: ReactNativeDevServerOptions,
  context: BuilderContext
): Observable<ReactNativeDevServerBuildOutput> {
  return from(getProjectRoot(context)).pipe(
    tap((root) => ensureNodeModulesSymlink(context.workspaceRoot, root)),
    switchMap((root) =>
      from(runCliStart(context.workspaceRoot, root, options))
    ),
    catchError((err) => {
      console.error(err);
      return throwError(err);
    }),
    switchMap(
      () =>
        new Observable<ReactNativeDevServerBuildOutput>((obs) => {
          obs.next({
            baseUrl: `http://${options.host}:${options.port}`,
            success: true
          });
        })
    )
  );
}

function runCliStart(workspaceRoot, projectRoot, options) {
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
