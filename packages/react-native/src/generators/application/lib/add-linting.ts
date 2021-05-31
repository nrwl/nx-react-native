import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { Linter, lintProjectGenerator } from '@nrwl/linter';
import {
  addDependenciesToPackageJson,
  joinPathFragments,
  updateJson,
  Tree,
} from '@nrwl/devkit';
import { extraEslintDependencies, createReactEslintJson } from '@nrwl/react';
import type { Linter as ESLintLinter } from 'eslint';
import { NormalizedSchema } from './normalize-options';

export async function addLinting(host: Tree, options: NormalizedSchema) {
  const lintTask = await lintProjectGenerator(host, {
    linter: Linter.EsLint,
    project: options.projectName,
    tsConfigPaths: [
      joinPathFragments(options.appProjectRoot, 'tsconfig.app.json'),
    ],
    eslintFilePatterns: [`${options.appProjectRoot}/**/*.{ts,tsx,js,jsx}`],
    skipFormat: true,
  });

  const reactEslintJson = createReactEslintJson(options.appProjectRoot);

  updateJson(
    host,
    joinPathFragments(options.appProjectRoot, '.eslintrc.json'),
    (json: ESLintLinter.Config) => {
      json = reactEslintJson;
      json.ignorePatterns = ['!**/*', 'public', '.cache', 'node_modules'];

      for (const override of json.overrides) {
        if (!override.files || override.files.length !== 2) {
          continue;
        }

        // for files ['*.tsx', '*.ts'], add rule '@typescript-eslint/ban-ts-comment': 'off'
        if (
          override.files.includes('*.ts') &&
          override.files.includes('*.tsx')
        ) {
          override.rules = override.rules || {};
          override.rules['@typescript-eslint/ban-ts-comment'] = 'off';
          continue;
        }

        // for files ['*.js', '*.jsx'], add rule '@typescript-eslint/no-var-requires': 'off'
        if (
          override.files.includes('*.js') &&
          override.files.includes('*.jsx')
        ) {
          override.rules = override.rules || {};
          override.rules['@typescript-eslint/no-var-requires'] = 'off';
          continue;
        }
      }

      return json;
    }
  );

  const installTask = await addDependenciesToPackageJson(
    host,
    extraEslintDependencies.dependencies,
    extraEslintDependencies.devDependencies
  );

  return runTasksInSerial(lintTask, installTask);
}
