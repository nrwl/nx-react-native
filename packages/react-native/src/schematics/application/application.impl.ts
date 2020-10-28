import { join, normalize, Path } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  filter,
  mergeWith,
  move,
  noop,
  pathTemplate,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  addLintFiles,
  formatFiles,
  generateProjectLint,
  Linter,
  names,
  NxJson,
  offsetFromRoot,
  toClassName,
  toFileName,
  updateJsonInTree,
} from '@nrwl/workspace';
import { updateWorkspaceInTree } from '@nrwl/workspace/src/utils/ast-utils';
import { toJS } from '@nrwl/workspace/src/utils/rules/to-js';
import init from '../init/init.impl';
import { Schema } from './schema';
import { podInstallTask } from '../../utils/pod-install-task';
import { extraEslintDependencies, reactEslintJson } from '@nrwl/react';
import { chmodTask } from '../../utils/chmod-task';

interface NormalizedSchema extends Schema {
  projectName: string;
  appProjectRoot: Path;
  className: string;
  lowerCaseName: string;
}

export default function (schema: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const options = normalizeOptions(host, schema);

    return chain([
      init({
        skipFormat: true,
      }),
      addLintFiles(options.appProjectRoot, Linter.EsLint, {
        localConfig: reactEslintJson,
        extraPackageDeps: extraEslintDependencies,
      }),
      createApplicationFiles(options),
      updateNxJson(options),
      addProject(options),
      addJest(options),
      podInstallTask(join(options.appProjectRoot, 'ios')),
      chmodTask(join(options.appProjectRoot, 'android', 'gradlew'), 0o775),
      formatFiles(options),
    ]);
  };
}

function createApplicationFiles(options: NormalizedSchema): Rule {
  const data = {
    ...names(options.name),
    ...options,
    offsetFromRoot: offsetFromRoot(options.appProjectRoot),
  };
  return mergeWith(
    apply(url(`./files/app`), [
      pathTemplate(data),
      applyTemplates(data),
      options.unitTestRunner === 'none'
        ? filter((file) => file !== `/src/app/App.spec.tsx`)
        : noop(),
      move(options.appProjectRoot),
      options.js ? toJS() : noop(),
    ])
  );
}

function updateNxJson(options: NormalizedSchema): Rule {
  return updateJsonInTree<NxJson>('nx.json', (json) => {
    const parsedTags = options.tags
      ? options.tags.split(',').map((s) => s.trim())
      : [];
    json.projects[options.projectName] = { tags: parsedTags };
    return json;
  });
}

function addProject(options: NormalizedSchema): Rule {
  return updateWorkspaceInTree((json) => {
    const architect: { [key: string]: any } = {};

    architect.start = {
      builder: '@nrwl/react-native:start',
      options: {
        port: 8081,
      },
    };

    architect['run-ios'] = {
      builder: '@nrwl/react-native:run-ios',
      options: {},
    };

    architect['bundle-ios'] = {
      builder: '@nrwl/react-native:bundle',
      outputs: [`${options.appProjectRoot}/build`],
      options: {
        entryFile: 'index.js',
        platform: 'ios',
        bundleOutput: 'dist/ios/index.bundle',
      },
    };

    architect['run-android'] = {
      builder: '@nrwl/react-native:run-android',
      options: {},
    };

    architect['build-android'] = {
      builder: '@nrwl/react-native:build-android',
      options: {},
    };

    architect['bundle-android'] = {
      builder: '@nrwl/react-native:bundle',
      outputs: [`${options.appProjectRoot}/dist/android`],
      options: {
        entryFile: 'index.js',
        platform: 'android',
        bundleOutput: 'dist/android/index.bundle',
      },
    };

    architect.lint = generateProjectLint(
      normalize(options.appProjectRoot),
      join(normalize(options.appProjectRoot), 'tsconfig.json'),
      Linter.EsLint,
      [`${options.appProjectRoot}/**/*.{js,ts,tsx}`]
    );

    json.projects[options.projectName] = {
      root: options.appProjectRoot,
      sourceRoot: join(options.appProjectRoot, 'src'),
      projectType: 'application',
      schematics: {},
      architect,
    };

    json.defaultProject = json.defaultProject || options.projectName;

    return json;
  });
}

function addJest(options: NormalizedSchema): Rule {
  return options.unitTestRunner === 'jest'
    ? externalSchematic('@nrwl/jest', 'jest-project', {
        project: options.projectName,
        supportTsx: true,
        skipSerializers: true,
        setupFile: 'none',
      })
    : noop();
}

function normalizeOptions(host: Tree, options: Schema): NormalizedSchema {
  const appDirectory = options.directory
    ? `${toFileName(options.directory)}/${toFileName(options.name)}`
    : toFileName(options.name);

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');

  const appProjectRoot = normalize(`apps/${appDirectory}`);

  const className = toClassName(options.name);

  return {
    ...options,
    displayName: options.displayName || options.name,
    className,
    lowerCaseName: className.toLowerCase(),
    name: toFileName(options.name),
    projectName: appProjectName,
    appProjectRoot,
  };
}
