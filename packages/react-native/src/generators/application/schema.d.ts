export interface Schema {
  name: string;
  displayName?: string;
  style?: string;
  skipFormat?: boolean;
  directory?: string;
  tags?: string;
  unitTestRunner?: 'jest' | 'none';
  pascalCaseFiles?: boolean;
  classComponent?: boolean;
  js?: boolean;
  setParserOptionsProject?: boolean;
}
