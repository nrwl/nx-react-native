import { join } from 'path';
import { existsSync, lstatSync, symlinkSync } from 'fs';
import { createDirectory } from '@nrwl/workspace';

export function ensureNodeModulesSymlink(
  workspaceRoot: string,
  projectRoot: string
) {
  const appNodeModulesPath = join(projectRoot, 'node_modules');
  if (
    !existsSync(appNodeModulesPath) ||
    lstatSync(appNodeModulesPath).isSymbolicLink()
  ) {
    createDirectory(appNodeModulesPath);
    symlinkSync(
      join(workspaceRoot, 'node_modules', 'react-native'),
      join(appNodeModulesPath, 'react-native')
    );
    symlinkSync(
      join(workspaceRoot, 'node_modules', 'jsc-android'),
      join(appNodeModulesPath, 'jsc-android')
    );
  }
}
