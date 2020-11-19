import { ReactNativeStartOptions } from '../schema';
import { concatMap, delay, map, retry, switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { isPackagerRunning } from './is-packager-running';
import { startAsync } from './start-async';

/*
 * Starts the JS bundler and checks for "running" status before notifying
 * that packager has started.
 */
export function runCliStart(
  workspaceRoot: string,
  projectRoot: string,
  options: ReactNativeStartOptions
) {
  return from(isPackagerRunning(options.port)).pipe(
    concatMap((status) =>
      status === 'running'
        ? new Observable<void>((obs) => obs.next()) // don't complete the
        : new Observable<void>((obs) => {
            // If packager is already running on the port, then notify its status.
            isPackagerRunning(options.port).then((status) => {
              if (status === 'running') return;
              return startAsync(workspaceRoot, projectRoot, options).catch(
                (e) => {
                  obs.error(e);
                  obs.complete();
                }
              );
            });
            obs.next();
          }).pipe(
            // Check every second (up to 30 times) to see if the packager is running
            concatMap(() =>
              of(options.port).pipe(
                switchMap((port) => from(isPackagerRunning(port))),
                delay(1000),
                map((status) => {
                  if (status === 'running') return status;
                  throw Error(`status: ${status}`);
                }),
                retry(30)
              )
            )
          )
    )
  );
}
