export interface ReactNativeRunIosOptions {
  configuration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
  packager: boolean;
  install?: boolean;
  sync?: boolean;
  terminal?: string;
}
