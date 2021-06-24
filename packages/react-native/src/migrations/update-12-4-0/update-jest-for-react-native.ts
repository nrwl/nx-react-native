import {
  formatFiles,
  logger,
  readProjectConfiguration,
  stripIndents,
  Tree,
} from '@nrwl/devkit';
import { join } from 'path';
import { forEachExecutorOptions } from '@nrwl/workspace/src/utilities/executor-options-utils';
import { JestExecutorOptions } from '@nrwl/jest/src/executors/jest/schema';
import { getJestObject } from '@nrwl/jest/src/migrations/update-10-0-0/require-jest-config';

/**
 * This function update jest.config.js and test.setup.ts for react native project for Jest 27.
 * Inside jest.config.js, remove ...workspacePreset because it has testEnvironment set as jsdom.
 * Just set preset as react-native is sufficient.
 * Also remove the jest.useFakeTimers() in test.setup.ts.
 */
function updateJestConfig(tree: Tree) {
  forEachExecutorOptions<JestExecutorOptions>(
    tree,
    '@nrwl/jest:jest',
    (options, project) => {
      if (!options.jestConfig) {
        return;
      }

      const jestConfigPath = options.jestConfig;
      const jestConfig = getJestObject(join(tree.root, jestConfigPath));
      const testEnvironment = jestConfig.testEnvironment;
      const preset = jestConfig.preset;

      if (testEnvironment === 'node' || preset !== 'react-native') {
        return;
      }

      try {
        const contents = tree.read(jestConfigPath, 'utf-8');
        tree.write(
          jestConfigPath,
          contents
            .replace(`...workspacePreset,`, '')
            .replace(
              `const workspacePreset = require('../../jest.preset');`,
              ''
            )
        );
      } catch {
        logger.error(
          stripIndents`Unable to update jest.config.js for project ${project}.`
        );
      }

      try {
        const { root } = readProjectConfiguration(tree, project);
        const setupTestPath = join(root, 'test-setup.ts');
        if (tree.exists(setupTestPath)) {
          const contents = tree.read(setupTestPath, 'utf-8');
          tree.write(
            setupTestPath,
            contents
              .replace(`jest.useFakeTimers();`, '')
              .replace(`import { jest } from '@jest/globals';`, '')
          );
        }
      } catch {
        logger.error(
          stripIndents`Unable to update test-setup.ts for project ${project}.`
        );
      }
    }
  );
}

export default async function update(tree: Tree) {
  updateJestConfig(tree);
  await formatFiles(tree);
}
