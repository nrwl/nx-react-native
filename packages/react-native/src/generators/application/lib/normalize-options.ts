import { names, Tree } from '@nrwl/devkit';
import { join } from 'path';
import { Schema } from '../schema';

export interface NormalizedSchema extends Schema {
  className: string;
  projectName: string;
  appProjectRoot: string;
  lowerCaseName: string;
  iosProjectRoot: string;
  androidProjectRoot: string;
  parsedTags: string[];
  entryFile: string;
}

export function normalizeOptions(
  host: Tree,
  options: Schema
): NormalizedSchema {
  const { fileName, className } = names(options.name);

  const directoryName = options.directory
    ? names(options.directory).fileName
    : '';
  const projectDirectory = directoryName
    ? `${directoryName}/${fileName}`
    : fileName;

  const appProjectName = projectDirectory.replace(new RegExp('/', 'g'), '-');

  const appProjectRoot = `apps/${projectDirectory}`;
  const iosProjectRoot = join(appProjectRoot, 'ios');
  const androidProjectRoot = join(appProjectRoot, 'android');

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const entryFile = join(host.root, appProjectRoot, '/src/main.tsx');

  /**
   * if options.name is "my-app"
   * name: "my-app", className: 'MyApp', lowerCaseName: 'myapp', displayName: 'MyApp', projectName: 'my-app', appProjectRoot: 'apps/my-app', androidProjectRoot: 'apps/my-app/android', iosProjectRoot: 'apps/my-app/ios'
   * if options.name is "myApp"
   * name: "my-app", className: 'MyApp', lowerCaseName: 'myapp', displayName: 'MyApp', projectName: 'my-app', appProjectRoot: 'apps/my-app', androidProjectRoot: 'apps/my-app/android', iosProjectRoot: 'apps/my-app/ios'
   */
  return {
    ...options,
    name: fileName,
    className,
    lowerCaseName: className.toLowerCase(),
    displayName: options.displayName || className,
    projectName: appProjectName,
    appProjectRoot,
    iosProjectRoot,
    androidProjectRoot,
    parsedTags,
    entryFile,
  };
}
