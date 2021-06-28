import { spawn } from 'child_process';
import { platform } from 'os';
import * as chalk from 'chalk';
import { GeneratorCallback, logger } from '@nrwl/devkit';

const podInstallErrorMessage = `
Running ${chalk.bold('pod install')} failed, see above.
Do you have CocoaPods (https://cocoapods.org/) installed?

Check that your XCode path is correct:
${chalk.bold('sudo xcode-select --print-path')}

If the path is wrong, switch the path: (your path may be different)
${chalk.bold('sudo xcode-select --switch /Applications/Xcode.app')}
`;

/**
 * Run pod install on current working directory
 * @param cwd current working directory
 * @returns resolve with 0 if not error, reject with error otherwise
 */
export function runPodInstall(cwd: string): GeneratorCallback {
  return () => {
    if (platform() !== 'darwin') {
      logger.info('Skipping `pod install` on non-darwin platform');
      return;
    }

    logger.info(`Running \`pod install\` from "${cwd}"`);

    return podInstall(cwd);
  };
}

export function podInstall(cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn('pod', ['install'], {
      cwd,
      stdio: [0, 1, 2],
    });

    process.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(podInstallErrorMessage));
      }
    });

    process.on('error', () => {
      reject(new Error(podInstallErrorMessage));
    });
  });
}
