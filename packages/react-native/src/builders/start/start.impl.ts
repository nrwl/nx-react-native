import * as chalk from 'chalk';
import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { getProjectRoot } from '../../utils/get-project-root';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { ReactNativeStartOptions } from './schema';
import { runCliStart } from './lib/run-cli-start';

export interface ReactNativeStartOutput {
  baseUrl?: string;
  success: boolean;
}

export default createBuilder<ReactNativeStartOptions>(run);

export function run(
  options: ReactNativeStartOptions,
  context: BuilderContext
): Observable<ReactNativeStartOutput> {
  return from(getProjectRoot(context)).pipe(
    tap((root) => ensureNodeModulesSymlink(context.workspaceRoot, root)),
    switchMap((root) => runCliStart(context.workspaceRoot, root, options)),
    map(() => ({
      baseUrl: `http://localhost:${options.port}`,
      success: true,
    })),
    tap((output) => {
      const appName = context.target.project;
      context.logger.info(chalk.cyan(`Packager is ready at ${output.baseUrl}`));
      context.logger.info(
        `Use ${chalk.bold(`nx run-android ${appName}`)} or ${chalk.bold(
          `nx run-ios ${appName}`
        )} to run the native app.`
      );
    }),
    catchError(() => of({ success: false }))
  );
}
