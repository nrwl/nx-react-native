import * as metroResolver from 'metro-resolver';
import type { MatchPath } from 'tsconfig-paths';
import { createMatchPath, loadConfig } from 'tsconfig-paths';
import * as chalk from 'chalk';

const DEBUG = process.env.NX_REACT_NATIVE_DEBUG === 'true';

/*
 * Use tsconfig to resolve additional workspace libs.
 *
 * This resolve function requires projectRoot to be set to
 * workspace root in order modules and assets to be registered and watched.
 */
export function resolveRequest(
  _context: any,
  realModuleName: string,
  platform: string | null,
  moduleName: string
) {
  if (DEBUG) console.log(chalk.cyan(`[Nx] Resolving: ${moduleName}`));

  const { resolveRequest, ...context } = _context;
  try {
    return metroResolver.resolve(context, moduleName, platform);
  } catch {
    if (DEBUG)
      console.log(
        chalk.cyan(
          `[Nx] Unable to resolve with default Metro resolver: ${moduleName}`
        )
      );
  }
  const matcher = getMatcher();
  const match = matcher(realModuleName);
  if (match) {
    return {
      type: 'sourceFile',
      filePath: match,
    };
  } else {
    if (DEBUG) {
      console.log(
        chalk.red(`[Nx] Failed to resolve ${chalk.bold(moduleName)}`)
      );
      console.log(
        chalk.cyan(
          `[Nx] The following tsconfig paths was used:\n:${chalk.bold(
            JSON.stringify(paths, null, 2)
          )}`
        )
      );
    }
    throw new Error(`Cannot resolve ${chalk.bold(moduleName)}`);
  }
}

let matcher: MatchPath;
let absoluteBaseUrl: string;
let paths: Record<string, string[]>;

function getMatcher() {
  if (!matcher) {
    const result = loadConfig();
    if (result.resultType === 'success') {
      absoluteBaseUrl = result.absoluteBaseUrl;
      paths = result.paths;
      if (DEBUG) {
        console.log(
          chalk.cyan(`[Nx] Located tsconfig at ${chalk.bold(absoluteBaseUrl)}`)
        );
        console.log(
          chalk.cyan(
            `[Nx] Found the following paths:\n:${chalk.bold(
              JSON.stringify(paths, null, 2)
            )}`
          )
        );
      }
      matcher = createMatchPath(absoluteBaseUrl, paths);
    } else {
      console.log(chalk.cyan(`[Nx] Failed to locate tsconfig}`));
      throw new Error(`Could not load tsconfig for project`);
    }
  }
  return matcher;
}
