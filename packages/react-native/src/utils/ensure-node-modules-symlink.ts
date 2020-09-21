import { join } from 'path';
import { existsSync, lstatSync, symlinkSync } from 'fs';
import { createDirectory } from '@nrwl/workspace';

export function ensureNodeModulesSymlink(
  workspaceRoot: string,
  projectRoot: string
) {
  const reactNativePath = join(workspaceRoot, 'node_modules', 'react-native');
  const appNodeModulesPath = join(projectRoot, 'node_modules');
  if (
    !existsSync(appNodeModulesPath) ||
    lstatSync(appNodeModulesPath).isSymbolicLink()
  ) {
    createDirectory(appNodeModulesPath);
    symlinkSync(reactNativePath, join(appNodeModulesPath, 'react-native'));
  }
}
