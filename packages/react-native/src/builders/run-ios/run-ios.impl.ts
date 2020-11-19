import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { join } from 'path';
import { fork } from 'child_process';
import { platform } from 'os';
import { getProjectRoot } from '../../utils/get-project-root';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import {
  displayNewlyAddedDepsMessage,
  syncDeps,
} from '../sync-deps/sync-deps.impl';
import { podInstall } from '../../utils/pod-install-task';
import { runCliStart } from '../start/lib/run-cli-start';

export interface ReactNativeRunIOsOptions extends JsonObject {
  configuration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
  packager: boolean;
  install?: boolean;
  sync?: boolean;
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
    throw new Error(`The run-ios build requires Mac to run`);
  }
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
      options.install
        ? podInstall(join(root, 'ios')).pipe(map(() => root))
        : of(root)
    ),
    concatMap((root) =>
      (options.packager
        ? runCliStart(context.workspaceRoot, root, { port: options.port })
        : new Observable((obs) => obs.next())
      ).pipe(
        switchMap(() =>
          from(runCliRunIOS(context.workspaceRoot, root, options))
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

function runCliRunIOS(workspaceRoot, projectRoot, options) {
  return new Promise((resolve, reject) => {
    const cp = fork(
      join(workspaceRoot, './node_modules/react-native/cli.js'),
      ['run-ios', ...createRunIOSOptions(options), '--no-packager'],
      {
        cwd: projectRoot,
        env: { ...process.env, RCT_METRO_PORT: options.port },
      }
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

function createRunIOSOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (options[k] && !nxOptions.includes(k)) acc.push(`--${k}`, options[k]);
    return acc;
  }, []);
}
