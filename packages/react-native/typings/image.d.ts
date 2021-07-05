// typing from https://github.com/kristerkari/react-native-svg-transformer/blob/master/README.md#using-typescript
declare module '*.svg' {
  import * as React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
