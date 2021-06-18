export interface ReactNativeRunAndroidOptions {
  variant: string;
  appId: string;
  appIdSuffix: string;
  mainActiviy: string;
  deviceId: string;
  tasks?: string;
  jetifier: boolean;
  sync: boolean;
  port: number;
  terminal?: string;
  packager: boolean;
}
