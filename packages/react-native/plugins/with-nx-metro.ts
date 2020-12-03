import { appRootPath } from '@nrwl/workspace/src/utils/app-root';
import { resolveRequest } from './metro-resolver';

interface WithNxOptions {
  debug?: boolean;
}

export function withNxMetro(config: any, opts: WithNxOptions = {}) {
  if (opts.debug) process.env.NX_REACT_NATIVE_DEBUG = 'true';

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
