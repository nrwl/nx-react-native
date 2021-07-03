const { execSync } = require('child_process');

const { readFileSync, writeFileSync, existsSync } = require('fs');

const { join } = require('path');

function updatePackageJson(packageJsonPath, version, isDist) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
  packageJson.version = version;
  if (isDist) {
    Object.keys(packageJson.dependencies).forEach((k) => {
      if (k === '@nrwl/detox') {
        packageJson.dependencies[k] = version;
      }
    });
  }
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
const outputPath = projectMeta.architect.build.options.outputPath;
if (!existsSync(outputPath)) {
  throw new Error('Must build the project first');
}

const root = projectMeta.root;

updatePackageJson(join(root, 'package.json'), version);
updatePackageJson(join(outputPath, 'package.json'), version, true);

execSync(`npm publish ${outputPath} --access public --tag ${tag}`);
