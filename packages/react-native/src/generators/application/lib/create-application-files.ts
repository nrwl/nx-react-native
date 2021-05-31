import { generateFiles, names, offsetFromRoot, Tree } from '@nrwl/devkit';
import { join } from 'path';
import { NormalizedSchema } from './normalize-options';

export function createApplicationFiles(host: Tree, options: NormalizedSchema) {
  generateFiles(host, join(__dirname, '../files/app'), options.appProjectRoot, {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.appProjectRoot),
  });
  if (options.unitTestRunner === 'none') {
    host.delete(join(options.appProjectRoot, `/src/app/App.spec.tsx`));
  }
}
