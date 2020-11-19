import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { join } from 'path';
import { getProjectRoot } from '../../utils/get-project-root';
import { fork } from 'child_process';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import {
  displayNewlyAddedDepsMessage,
  syncDeps,
} from '../sync-deps/sync-deps.impl';
import { runCliStart } from '../start/lib/run-cli-start';

export interface ReactNativeRunAndroidOptions extends JsonObject {
  configuration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
  packager: boolean;
  sync?: boolean;
}

export interface ReactNativeRunAndroidOutput {
  success: boolean;
}

export default createBuilder<ReactNativeRunAndroidOptions>(run);

function run(
  options: ReactNativeRunAndroidOptions,
  context: BuilderContext
): Observable<ReactNativeRunAndroidOutput> {
  return from(getProjectRoot(context)).pipe(
    tap((root) => ensureNodeModulesSymlink(context.workspaceRoot, root)),
    tap(
      (root) =>
        options.sync &&
        displayNewlyAddedDepsMessage(
          context.target.project,
          syncDeps(context.target.project, root),
          context
        )
    ),
    concatMap((root) =>
      (options.packager
        ? runCliStart(context.workspaceRoot, root, { port: options.port })
        : new Observable((obs) => obs.next())
      ).pipe(
        switchMap(() =>
          from(runCliRunAndroid(context.workspaceRoot, root, options))
        )
      )
    ),
    map(() => {
      return {
        success: true,
      };
    }),
    catchError(() => {
      return of({ success: false });
    })
  );
}

function runCliRunAndroid(workspaceRoot, projectRoot, options) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, './node_modules/react-native/cli.js'),
      ['run-android', ...createRunAndroidOptions(options), '--no-packager'],
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

const nxOptions = ['sync', 'install', 'packager'];

function createRunAndroidOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    const v = options[k];
    if (k === 'mainActivity') {
      acc.push(`--main-activity`, v);
    } else if (k === 'jetifier' && v) {
      acc.push(`--no-jetifier`);
    } else if (v && !nxOptions.includes(k)) {
      acc.push(`--${k}`, v);
    }
    return acc;
  }, []);
}
