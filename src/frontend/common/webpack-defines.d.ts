declare const MIRO_APP_CLIENT_ID: string;
declare const MIRO_BASE_URL: string;
declare const LOCAL_BASE_URL: string;
declare const ANALYTICS_URL: string;
declare const ANALYTICS_KEY: string;
declare const VERSION: string;

declare module '*.scss' {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}
