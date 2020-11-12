import { join } from 'path';
import { platform } from 'os';
import { existsSync, symlinkSync } from 'fs';
import { createDirectory } from '@nrwl/workspace';

export function ensureNodeModulesSymlink(
  workspaceRoot: string,
  projectRoot: string
) {
  const appNodeModulesPath = join(projectRoot, 'node_modules');
  // `mklink /D` requires admin privilege in Windows so we need to use junction
  const symlinkType = platform() === 'win32' ? 'junction' : 'dir';
  const appReactNativePath = join(appNodeModulesPath, 'react-native');
  const appJscAndroidPath = join(appNodeModulesPath, 'jsc-android');
  if (!existsSync(appReactNativePath) || !existsSync(appJscAndroidPath)) {
    createDirectory(appNodeModulesPath);
    symlinkSync(
      join(workspaceRoot, 'node_modules', 'react-native'),
      appReactNativePath,
      symlinkType
    );
    symlinkSync(
      join(workspaceRoot, 'node_modules', 'jsc-android'),
      appJscAndroidPath,
      symlinkType
    );
  }
}
