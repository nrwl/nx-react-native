import {
  checkFilesExist,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

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
});
