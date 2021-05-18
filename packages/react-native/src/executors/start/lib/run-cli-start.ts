import { logger } from '@nrwl/devkit';

import { ReactNativeStartOptions } from '../schema';
import { isPackagerRunning } from './is-packager-running';
import { startAsync } from './start-async';

/*
 * Starts the JS bundler and checks for "running" status before notifying
 * that packager has started.
 */
export async function runCliStart(
  workspaceRoot: string,
  projectRoot: string,
  options: ReactNativeStartOptions
): Promise<void> {
  const result = await isPackagerRunning(options.port);
  if (result === 'running') {
    logger.info('JS server already running.');
  } else if (result === 'unrecognized') {
    logger.error('JS server not recognized.');
  } else {
    // result === 'not_running'
    logger.info('Starting JS server...');

    try {
      startAsync(workspaceRoot, projectRoot, options);
    } catch (error) {
      logger.error(
        `Failed to start the packager server. Error details: ${error.message}`
      );
      throw error;
    }
  }

  // Check every second (up to 30 times) to see if the packager is running
  let count = 0;
  const check = setInterval(() => {
    isPackagerRunning(options.port).then((runningStatus) => {
      if (count === 30) {
        clearInterval(check); // if it is 30 times, stop checking
      }
      if (count > 0 && runningStatus != 'running') {
        // add count > 0  tp skip the 1st check
        // if it is not running, throw an error
        clearInterval(check);
        throw new Error(
          `Failed to start the packager server. Status: ${runningStatus}`
        );
      } else {
        count++;
      }
    });
  }, 1000);
}
