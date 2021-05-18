export interface ReactNativeRunAndroidOptions {
  configuration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
  packager: boolean;
  sync?: boolean;
  terminal?: string;
}
