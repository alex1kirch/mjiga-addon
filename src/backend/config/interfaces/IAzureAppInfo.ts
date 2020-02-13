export default interface IAzureAppInfo {
  oauthUrl: string;
  exchangeUrl: string;
  appId: string;
  scope: string;
  clientSecret: string;
  appSecret: string;
  redirectPath: string;
}
