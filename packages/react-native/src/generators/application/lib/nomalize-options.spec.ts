import { Schema } from '../schema';
import { normalizeOptions } from './normalize-options';

describe('Normalize Options', () => {
  it('should normalize options with name in kebab case', () => {
    const schema: Schema = {
      name: 'my-app',
    };
    const options = normalizeOptions(schema);
    expect(options).toEqual({
      androidProjectRoot: 'apps/my-app/android',
      appProjectRoot: 'apps/my-app',
      className: 'MyApp',
      displayName: 'MyApp',
      iosProjectRoot: 'apps/my-app/ios',
      lowerCaseName: 'myapp',
      name: 'my-app',
      parsedTags: [],
      projectName: 'my-app',
    });
  });

  it('should normalize options with name in camel case', () => {
    const schema: Schema = {
      name: 'myApp',
    };
    const options = normalizeOptions(schema);
    expect(options).toEqual({
      androidProjectRoot: 'apps/my-app/android',
      appProjectRoot: 'apps/my-app',
      className: 'MyApp',
      displayName: 'MyApp',
      iosProjectRoot: 'apps/my-app/ios',
      lowerCaseName: 'myapp',
      name: 'my-app',
      parsedTags: [],
      projectName: 'my-app',
    });
  });

  it('should normalize options with directory', () => {
    const schema: Schema = {
      name: 'my-app',
      directory: 'directory',
    };
    const options = normalizeOptions(schema);
    expect(options).toEqual({
      androidProjectRoot: 'apps/directory/my-app/android',
      appProjectRoot: 'apps/directory/my-app',
      className: 'MyApp',
      displayName: 'MyApp',
      iosProjectRoot: 'apps/directory/my-app/ios',
      lowerCaseName: 'myapp',
      name: 'my-app',
      directory: 'directory',
      parsedTags: [],
      projectName: 'directory-my-app',
    });
  });

  it('should normalize options with display name', () => {
    const schema: Schema = {
      name: 'my-app',
      displayName: 'My App',
    };
    const options = normalizeOptions(schema);
    expect(options).toEqual({
      androidProjectRoot: 'apps/my-app/android',
      appProjectRoot: 'apps/my-app',
      className: 'MyApp',
      displayName: 'My App',
      iosProjectRoot: 'apps/my-app/ios',
      lowerCaseName: 'myapp',
      name: 'my-app',
      parsedTags: [],
      projectName: 'my-app',
    });
  });
});
