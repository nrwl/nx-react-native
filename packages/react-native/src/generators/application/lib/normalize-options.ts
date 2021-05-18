import { names, Tree } from '@nrwl/devkit';
import { join } from 'path';
import { Schema } from '../schema';

export interface NormalizedSchema extends Schema {
  projectName: string;
  appProjectRoot: string;
  lowerCaseName: string;
  iosProjectRoot: string;
  androidProjectRoot: string;
  parsedTags: string[];
}

export function normalizeOptions(
  host: Tree,
  options: Schema
): NormalizedSchema {
  const fileName = names(options.name).fileName;

  const directoryName = options.directory
    ? names(options.directory).fileName
    : '';
  const projectDirectory = options.directory
    ? `${directoryName}/${fileName}`
    : fileName;

  const appProjectName = projectDirectory.replace(new RegExp('/', 'g'), '-');

  const appProjectRoot = `apps/${projectDirectory}`;
  const iosProjectRoot = join(appProjectRoot, 'ios');
  const androidProjectRoot = join(appProjectRoot, 'android');

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    lowerCaseName: names(options.name).className.toLowerCase(),
    projectName: appProjectName,
    appProjectRoot,
    iosProjectRoot,
    androidProjectRoot,
    parsedTags,
  };
}
