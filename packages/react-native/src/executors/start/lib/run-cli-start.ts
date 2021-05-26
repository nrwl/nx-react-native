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
) {
  const status = await isPackagerRunning(options.port);
  if (status !== 'running') {
    await startAsync(workspaceRoot, projectRoot, options);
  }

  return await new Promise<void>((resolve, reject) => {
    // Check every second (up to 30 times) to see if the packager is running
    let count = 0;
    const check = setInterval(() => {
      isPackagerRunning(options.port).then((runningStatus) => {
        if (count === 30) {
          clearInterval(check); // if it is 30 times, stop checking
          resolve();
        }
        if (runningStatus != 'running') {
          // if it is not running
          clearInterval(check);
          reject(new Error(`status: ${runningStatus}`));
        } else {
          count++;
        }
      });
    }, 1000);
  });
}
