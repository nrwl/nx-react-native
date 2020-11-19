import { JsonObject } from '@angular-devkit/core';

export interface ReactNativeStartOptions extends JsonObject {
  port: number;
  resetCache?: boolean;
}
