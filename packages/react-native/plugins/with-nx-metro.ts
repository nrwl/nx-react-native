import { appRootPath } from '@nrwl/workspace/src/utils/app-root';
import { resolveRequest } from './metro-resolver';

export function withNxMetro(config) {
  const resolver = config.resolver || {};

  // Set the root to workspace root so we can resolve modules and assets
  config.projectRoot = appRootPath;

  // Add support for paths specified by tsconfig
  config.resolver = {
    ...resolver,
    resolveRequest,
  };

  return config;
}
