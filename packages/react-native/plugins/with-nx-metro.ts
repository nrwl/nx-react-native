import { appRootPath } from '@nrwl/workspace/src/utils/app-root';
import { join } from 'path';
import { resolveRequest } from './metro-resolver';
import { workspaceLayout } from '@nrwl/workspace/src/core/file-utils';

export function withNxMetro(config: any) {
  const watchFolders = config.watchFolders || [];
  const resolver = config.resolver || {};
  config.watchFolders = watchFolders.concat([
    join(appRootPath, 'node_modules'),
    join(appRootPath, workspaceLayout().libsDir),
  ]);
  // TODO: fix resolver and uncomment
  // config.resolver = {
  //   ...resolver,
  //   resolveRequest,
  // };
  return config;
}
