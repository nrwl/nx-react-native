import {
  checkFilesExist,
  ensureNxProject,
  readFile,
  runNxCommandAsync,
  uniq,
  updateFile,
} from '@nrwl/nx-plugin/testing';
import { join } from 'path';

test('create ios and android JS bundles', async () => {
  const appName = uniq('my-app');
  ensureNxProject('@nrwl/react-native', 'dist/packages/react-native');
  await runNxCommandAsync(`generate @nrwl/react-native:application ${appName}`);

  await expect(runNxCommandAsync(`test ${appName}`)).resolves.toMatchObject({
    stdout: expect.any(String),
  });

  const iosBundleResult = await runNxCommandAsync(`bundle-ios ${appName}`);
  expect(iosBundleResult.stdout).toContain('Done writing bundle output');
  expect(() =>
    checkFilesExist(`dist/apps/${appName}/ios/main.bundle`)
  ).not.toThrow();

  const androidBundleResult = await runNxCommandAsync(
    `bundle-android ${appName}`
  );
  expect(androidBundleResult.stdout).toContain('Done writing bundle output');
  expect(() =>
    checkFilesExist(`dist/apps/${appName}/android/main.bundle`)
  ).not.toThrow();
});

test('sync npm dependencies for autolink', async () => {
  const appName = uniq('my-app');
  ensureNxProject('@nrwl/react-native', 'dist/packages/react-native');
  await runNxCommandAsync(`generate @nrwl/react-native:application ${appName}`);
  // Add npm package with native modules
  updateFile(join('package.json'), (content) => {
    const json = JSON.parse(content);
    json.dependencies['react-native-image-picker'] = '1.0.0';
    json.dependencies['react-native-gesture-handler'] = '1.0.0';
    json.dependencies['react-native-safe-area-contex'] = '1.0.0';
    return JSON.stringify(json, null, 2);
  });
  // Add import for Nx to pick up
  updateFile(join('apps', appName, 'src/app/App.tsx'), (content) => {
    return `import { launchImageLibrary } from 'react-native-image-picker';\n${content}`;
  });

  await runNxCommandAsync(
    `sync-deps ${appName} --include=react-native-gesture-handler,react-native-safe-area-context`
  );

  const result = JSON.parse(readFile(join('apps', appName, 'package.json')));
  expect(result).toMatchObject({
    dependencies: {
      'react-native-image-picker': '*',
      'react-native-gesture-handler': '*',
      'react-native-safe-area-context': '*',
    },
  });
});
