import { Tree, updateJson } from '@nrwl/devkit';
import { addPropertyToJestConfig, jestProjectGenerator } from '@nrwl/jest';
import { NormalizedSchema } from './normalize-options';

export async function addJest(host: Tree, options: NormalizedSchema) {
  if (options.unitTestRunner !== 'jest') {
    return () => {};
  }

  const jestTask = await jestProjectGenerator(host, {
    project: options.projectName,
    supportTsx: true,
    skipSerializers: true,
    setupFile: 'none',
    babelJest: true,
  });

  /* const jestConfigPath = `${options.appProjectRoot}/jest.config.js`;
  addPropertyToJestConfig(host, jestConfigPath, 'preset', 'react-native');
  addPropertyToJestConfig(
    host,
    jestConfigPath,
    'setupFilesAfterEnv',
    '<rootDir>/test-setup.ts'
  );
  addPropertyToJestConfig(host, jestConfigPath, 'transform', {
    '\\\\.(js|ts|tsx)$': `require.resolve('react-native/jest/preprocessor.js')`,
    '^.+\\\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$': `require.resolve(
      'react-native/jest/assetFileTransformer.js'
    )`,
  }); */

  return jestTask;
}
