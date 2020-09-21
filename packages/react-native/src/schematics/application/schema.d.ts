export interface Schema {
  name: string;
  style?: string;
  skipFormat: boolean;
  directory?: string;
  tags?: string;
  unitTestRunner: 'jest' | 'none';
  pascalCaseFiles?: boolean;
  classComponent?: boolean;
  displayName?: boolean;
  js?: boolean;
}
