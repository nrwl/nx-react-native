import {
  addDependenciesToPackageJson,
  Tree,
  formatFiles,
  getProjects,
  updateJson,
  offsetFromRoot,
  readJson,
  ProjectConfiguration,
  logger,
  stripIndents,
} from '@nrwl/devkit';
import {
  reactNativeSvgTransformerVersion,
  reactNativeSvgVersion,
} from '../../utils/versions';

/**
 * Add support to display svg in react native:
 * - Add react-native-svg-transform and react-native-svg packages to workspace's package.json.
 * - Add typing to app's tsconfig.json.
 * - Add react-native-svg to app's package.json.
 */
export default async function update(tree: Tree) {
  const packagesJson = readJson(tree, 'package.json');
  const packages = Object.keys({
    ...packagesJson.dependencies,
    ...packagesJson.devDependencies,
  });

  if (!packages.includes('react-native')) {
    return;
  }

  addReactNativeSvgToTsconfigAndPackageJson(tree);

  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      'react-native-svg-transformer': reactNativeSvgTransformerVersion,
      'react-native-svg': reactNativeSvgVersion,
    }
  );
  await formatFiles(tree);

  return installTask;
}

function addReactNativeSvgToTsconfigAndPackageJson(host: Tree) {
  const projects = getProjects(host);

  projects.forEach((project) => {
    if (project.targets?.start?.executor !== '@nrwl/react-native:start') return;

    addReactNativeSvgToTsconfig(host, project);
    addReactNativeSvgToPackageJson(host, project);
    mockSvgInJestConfig(host, project);
  });
}

function addReactNativeSvgToTsconfig(
  host: Tree,
  project: ProjectConfiguration
) {
  const tsconfigPath = `${project.root}/tsconfig.json`;
  if (!host.exists(tsconfigPath)) return;
  const offset = offsetFromRoot(project.root);
  updateJson(host, tsconfigPath, (json) => {
    const files = json.files || [];
    files.push(`${offset}node_modules/@nrwl/react-native/typings/image.d.ts`);
    json.files = files;
    return json;
  });
}

function addReactNativeSvgToPackageJson(
  host: Tree,
  project: ProjectConfiguration
) {
  const packageJSonPath = `${project.root}/package.json`;
  if (!host.exists(packageJSonPath)) return;
  updateJson(host, packageJSonPath, (json) => {
    const dependencies = json.dependencies || {};
    dependencies['react-native-svg'] = '*';
    return json;
  });
}

function mockSvgInJestConfig(host: Tree, project: ProjectConfiguration) {
  const jestConfigPath = project.targets?.test?.options?.jestConfig;
  if (!jestConfigPath || !host.exists(jestConfigPath)) return;
  try {
    const contents = host.read(jestConfigPath, 'utf-8');
    if (contents.includes('moduleNameMapper')) return;
    host.write(
      jestConfigPath,
      contents.replace(
        /,([^,]*)$/,
        `, moduleNameMapper: {'\\.svg': require.resolve('@nrwl/react-native/src/utils/svg-mock.js')}, $1`
      )
    );
  } catch {
    logger.error(
      stripIndents`Unable to update ${jestConfigPath} for project ${project}.`
    );
  }
}
