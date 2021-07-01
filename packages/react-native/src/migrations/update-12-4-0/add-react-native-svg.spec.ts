import { addProjectConfiguration, readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  reactNativeSvgTransformerVersion,
  reactNativeSvgVersion,
} from '../../utils/versions';
import update from './add-react-native-svg';

describe('Add react-native-svg to dev dependencies 12.4.0', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'products', {
      root: 'apps/products',
      sourceRoot: 'apps/products/src',
      targets: {
        start: {
          executor: '@nrwl/react-native:start',
          options: {
            port: 8081,
          },
        },
        test: {
          executor: '@nrwl/jest:jest',
          options: {
            jestConfig: 'apps/products/jest.config.js',
            passWithNoTests: true,
          },
        },
      },
    });
  });

  it(`should update libs if dependencies contain react-native`, async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        dependencies: { 'react-native': '*' },
        devDependencies: {},
      })
    );

    await update(tree);
    const devDependencies = readJson(tree, 'package.json').devDependencies;

    expect(devDependencies['react-native-svg']).toEqual(reactNativeSvgVersion);
    expect(devDependencies['react-native-svg-transformer']).toEqual(
      reactNativeSvgTransformerVersion
    );
  });

  it(`should not update libs if dependencies do not contain react-native`, async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        dependencies: {},
        devDependencies: {},
      })
    );

    await update(tree);
    const devDependencies = readJson(tree, 'package.json').devDependencies;

    expect(devDependencies['react-native-svg']).toEqual(undefined);
    expect(devDependencies['react-native-svg-transformer']).toEqual(undefined);
  });

  it(`should add react-native-svg app tsconfig.json and package.json`, async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        dependencies: { 'react-native': '*' },
        devDependencies: {},
      })
    );

    tree.write('apps/products/tsconfig.json', '{}');
    tree.write(
      'apps/products/package.json',
      JSON.stringify({
        dependencies: {},
      })
    );
    tree.write(
      'apps/products/jest.config.js',
      `module.exports = {
      preset: 'react-native',
    };`
    );
    await update(tree);

    const tsconfig = readJson(tree, 'apps/products/tsconfig.json');
    expect(tsconfig.files).toEqual([
      '../../node_modules/@nrwl/react-native/typings/image.d.ts',
    ]);

    const packageJson = readJson(tree, 'apps/products/package.json');
    expect(packageJson.dependencies).toEqual({ 'react-native-svg': '*' });

    const jestConfig = tree.read('apps/products/jest.config.js', 'utf-8');
    expect(jestConfig).toContain(
      `moduleNameMapper: {'\\.svg': require.resolve('@nrwl/react-native/src/utils/svg-mock.js')},`
    );
  });

  it(`should not add react-native-svg app tsconfig.json and package.json if files do not exist`, async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        dependencies: { 'react-native': '*' },
        devDependencies: {},
      })
    );

    await update(tree);

    expect(() => readJson(tree, 'apps/products/tsconfig.json')).toThrow();
    expect(() => readJson(tree, 'apps/products/package.json')).toThrow();
  });
});
