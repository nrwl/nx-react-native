import * as chalk from 'chalk';
import { ensureNodeModulesSymlink } from '../../utils/ensure-node-modules-symlink';
import { ReactNativeStartOptions } from './schema';
import { ExecutorContext, logger } from '@nrwl/devkit';
import { runCliStart } from './lib/run-cli-start';

export interface ReactNativeStartOutput {
  baseUrl?: string;
  success: boolean;
}

export async function* startExecutor(
  options: ReactNativeStartOptions,
  context: ExecutorContext
): AsyncGenerator<ReactNativeStartOutput> {
  const projectRoot = context.workspace.projects[context.projectName].root;
  ensureNodeModulesSymlink(context.root, projectRoot);

  runCliStart(context.root, projectRoot, options);

  const baseUrl = `http://localhost:${options.port}`;
  const appName = context.projectName;
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
  await new Promise<{ success: boolean }>(() => {});
}

export default startExecutor;
