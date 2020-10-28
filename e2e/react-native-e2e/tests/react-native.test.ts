import { checkFilesExist, ensureNxProject, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing';

test('bundling ios app', async () => {
  const appName = uniq('my-app');
  ensureNxProject('@nrwl/react-native', 'dist/packages/react-native');
  await runNxCommandAsync(`generate @nrwl/react-native:app ${appName}`);

  const iosBundleResult = await runNxCommandAsync(
    `bundle-ios ${appName}`
  );
  expect(iosBundleResult.stdout).toContain('Done writing bundle output');
  expect(() =>
    checkFilesExist(`apps/${appName}/dist/ios/index.bundle`)
  ).not.toThrow();

  const androidBundleResult = await runNxCommandAsync(
    `bundle-android ${appName}`
  );
  expect(androidBundleResult.stdout).toContain('Done writing bundle output');
  expect(() =>
    checkFilesExist(`apps/${appName}/dist/android/index.bundle`)
  ).not.toThrow();
}, 240000);
