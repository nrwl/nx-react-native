import * as chalk from 'chalk';
import { join } from 'path';
import { platform } from 'os';
import * as fs from 'fs';
import { createDirectory, readJsonFile } from '@nrwl/workspace';

const packagesToSymlink = [
  'react-native',
  'jsc-android',
  '@react-native-community/cli-platform-ios',
  '@react-native-community/cli-platform-android',
  'hermes-engine',
  '@nrwl/react-native',
  '@babel/runtime',
];

export function ensureNodeModulesSymlink(
  workspaceRoot: string,
  projectRoot: string
) {
  const appNodeModulesPath = join(projectRoot, 'node_modules');
  // `mklink /D` requires admin privilege in Windows so we need to use junction
  const symlinkType = platform() === 'win32' ? 'junction' : 'dir';

  createDirectory(appNodeModulesPath);

  packagesToSymlink.forEach((p) => {
    const dir = join(appNodeModulesPath, p);
    if (!fs.existsSync(dir)) {
      if (isScopedPackage(p))
        createDirectory(join(appNodeModulesPath, getScopedData(p).scope));
      fs.symlinkSync(locateNpmPackage(workspaceRoot, p), dir, symlinkType);
    }
    if (!fs.existsSync(join(dir, 'package.json'))) {
      throw new Error(
        `Invalid symlink ${chalk.bold(dir)}. Remove ${chalk.bold(
          appNodeModulesPath
        )} and try again.`
      );
    }
  });
}

function locateNpmPackage(workspaceRoot: string, packageName: string): string {
  const pnpmDir = join(workspaceRoot, 'node_modules/.pnpm');
  const isPnpm = fs.existsSync(pnpmDir);
  if (!isPnpm) {
    return join(workspaceRoot, 'node_modules', packageName);
  }

  let candidates: string[];
  if (isScopedPackage(packageName)) {
    const { scope, name } = getScopedData(packageName);
    const scopedDir = join(pnpmDir, scope);
    candidates = fs
      .readdirSync(scopedDir)
      .filter((f) => f.startsWith(name))
      .map((p) => join(scope, p));
  } else {
    candidates = fs
      .readdirSync(pnpmDir)
      .filter(
        (f) =>
          f.startsWith(packageName) &&
          fs.lstatSync(join(pnpmDir, f)).isDirectory()
      );
  }

  if (candidates.length === 0) {
    throw new Error(`Could not locate pnpm directory for ${packageName}`);
  } else if (candidates.length === 1) {
    return join(pnpmDir, candidates[0], 'node_modules', packageName);
  } else {
    const packageJson = readJsonFile(join(workspaceRoot, 'package.json'));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    const version = deps['react-native'];
    const found = candidates.find((c) => c.includes(version));
    if (found) {
      return join(pnpmDir, found, 'node_modules', packageName);
    } else {
      throw new Error(
        `Cannot find ${packageName}@${version}. Install it with 'pnpm install --save ${packageName}@${version}'.`
      );
    }
  }
}

function isScopedPackage(p) {
  return p.startsWith('@');
}

function getScopedData(p) {
  const [scope, name] = p.split('/');
  return { scope, name };
}
