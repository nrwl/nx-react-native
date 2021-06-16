import { readJsonFile, writeJsonFile } from '@nrwl/devkit';
import { runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing';
import { platform } from 'os';

describe('Detox iOS', () => {
  // Currently there is known issue that for react native 0.65rc, Folly dual symbols preventing ios from building successfully.
  xtest('should pass detox e2e tests on ios', async () => {
    if (platform() !== 'darwin') {
      return;
    }
    const myapp = uniq('myapp');
    await runNxCommandAsync(
      `generate @nrwl/react-native:app ${myapp} --e2eTestRunner=detox --linter=eslint`
    );

    const androidBuildResult = await runNxCommandAsync(
      `build-ios ${myapp}-e2e`
    );
    expect(androidBuildResult.stdout).toContain('BUILD SUCCESS');

    const androidTestResult = await runNxCommandAsync(
      `test-ios ${myapp}-e2e --cleanup`
    );
    expect(androidTestResult.stdout).toContain(
      'Running target "test-ios" succeeded'
    );
  });
});
