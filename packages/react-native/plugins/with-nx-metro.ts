import { join } from 'path';
import { appRootPath } from '@nrwl/workspace/src/utils/app-root';
import { workspaceLayout } from '@nrwl/workspace/src/core/file-utils';
import { resolveRequest } from './metro-resolver';

export function withNxMetro(config: any) {
  const watchFolders = config.watchFolders || [];
  const resolver = config.resolver || {};

  config.watchFolders = watchFolders.concat([
    join(appRootPath, 'node_modules'),
    join(appRootPath, workspaceLayout().libsDir),
  ]);

  config.resolver = {
    ...resolver,
    resolveRequest,
  };

  return config;
}
