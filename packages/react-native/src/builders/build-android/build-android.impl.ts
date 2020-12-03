import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { join } from 'path';
import { getProjectRoot } from '../../utils/get-project-root';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { spawn } from 'child_process';
import { chmodSync } from 'fs';

export interface ReactNativeBuildOptions extends JsonObject {
  apk?: boolean;
}

export interface ReactNativeBuildOutput {
  success: boolean;
}

export default createBuilder<ReactNativeBuildOptions>(run);

function run(
  options: ReactNativeBuildOptions,
  context: BuilderContext
): Observable<ReactNativeBuildOutput> {
  return from(getProjectRoot(context)).pipe(
    tap((root) => {
      ensureNodeModulesSymlink(context.workspaceRoot, root);
      chmodSync(join(root, 'android', 'gradlew'), 0o775);
      chmodSync(join(root, 'android', 'gradlew.bat'), 0o775);
    }),
    switchMap((root) => runCliBuild(context.workspaceRoot, root, options)),
    map(() => {
      return {
        success: true,
      };
    })
  );
}

function runCliBuild(
  workspaceRoot,
  projectRoot,
  options: ReactNativeBuildOptions
) {
  return new Promise((resolve, reject) => {
    const cp = spawn(
      join(projectRoot, 'android/gradlew'),
      [options.apk ? 'assembleRelease' : 'bundleRelease'],
      {
        cwd: join(projectRoot, 'android'),
        stdio: [0, 1, 2],
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
