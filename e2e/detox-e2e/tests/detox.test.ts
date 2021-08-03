import {
  checkFilesExist,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
import { platform } from 'os';

describe('Detox', () => {
  test('should create files and run lint command', async () => {
    const appName = uniq('myapp');
    await runNxCommandAsync(
      `generate @nrwl/react-native:app ${appName} --e2eTestRunner=detox --linter=eslint`
    );

    checkFilesExist(`apps/${appName}-e2e/.detoxrc.json`);
    checkFilesExist(`apps/${appName}-e2e/tsconfig.json`);
    checkFilesExist(`apps/${appName}-e2e/tsconfig.e2e.json`);
    checkFilesExist(`apps/${appName}-e2e/test-setup.ts`);
    checkFilesExist(`apps/${appName}-e2e/src/app.spec.ts`);

    await expect(runNxCommandAsync(`test ${appName}`)).resolves.toMatchObject({
      stdout: expect.any(String),
    });
  });

  test('should test ios e2e', async () => {
    if (platform() !== 'darwin') {
      return;
    }

    const appName = uniq('myapp');
    await runNxCommandAsync(
      `generate @nrwl/react-native:app ${appName} --e2eTestRunner=detox --linter=eslint`
    );

    await runNxCommandAsync(`build-ios ${appName}-e2e`);
    await expect(
      await runNxCommandAsync(`test-ios ${appName}-e2e --cleanup`)
    ).resolves.toMatchObject({
      stdout: expect.any(String),
    });
  });
});
