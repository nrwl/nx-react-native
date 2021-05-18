const { execSync } = require('child_process');

const { readFileSync, writeFileSync, existsSync } = require('fs');

const { join } = require('path');

function publish(dir, tag) {
  execSync(`npm publish ${dir} --access public --tag ${tag}`);
}

function updatePackageJson(packageJsonPath, version) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
  packageJson.version = version;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function getProject(project) {
  const workspaceJson = JSON.parse(readFileSync('workspace.json').toString());
  return workspaceJson.projects[project];
}

const [_, _2, project] = process.argv;
const version = process.env.VERSION;
const tag = process.env.TAG || 'next';

if (!project) {
  throw new Error('Need the project');
}
if (!version) {
  throw new Error('Need the version');
}
const projectMeta = getProject(project);
const outputPath = projectMeta.targets.build.options.outputPath;
if (!existsSync(outputPath)) {
  throw new Error('Must build the project first');
}

const root = projectMeta.root;
updatePackageJson(join(root, 'package.json'), version);
updatePackageJson(join(outputPath, 'package.json'), version);
publish(outputPath, tag);
