import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
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

export interface ReactNativeRunIOsOptions extends JsonObject {
  configuration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
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
    switchMap((root) =>
      options.install
        ? podInstall(join(root, 'ios')).pipe(map(() => root))
        : of(root)
    ),
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

const nxOptions = ['sync', 'install', 'no-sync'];

function createRunIOSOptions(options) {
  return Object.keys(options).reduce((acc, k) => {
    if (options[k] && !nxOptions.includes(k)) acc.push(`--${k}`, options[k]);
    return acc;
  }, []);
}
