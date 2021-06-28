export interface ReactNativeRunIosOptions {
  xcodeConfiguration: string;
  port: number;
  scheme: string;
  simulator: string;
  device: string;
  packager: boolean;
  install?: boolean;
  sync?: boolean;
  terminal?: string;
}
