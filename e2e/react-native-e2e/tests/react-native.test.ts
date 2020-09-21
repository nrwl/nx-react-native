import {
  ensureNxProject,
  runNxCommandAsync,
  uniq,
  checkFilesExist,
} from '@nrwl/nx-plugin/testing';

test('bundling ios app', async () => {
  const appName = uniq('my-app');
  ensureNxProject('@nrwl/react-native', 'dist/packages/react-native');
  await runNxCommandAsync(`generate @nrwl/react-native:app ${appName}`);

  const result = await runNxCommandAsync(
    `bundle ${appName} --platform=ios --entryFile=./index.js --bundle-output=index.ios.bundle`
  );
  expect(result.stdout).toContain('Done writing bundle output');
  expect(() =>
    checkFilesExist(`apps/${appName}/index.ios.bundle`)
  ).not.toThrow();
}, 120000);
