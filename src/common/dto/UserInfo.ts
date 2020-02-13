export default interface UserInfo {
  id: string;
  accountId: string;
  installationId: string;
  isAdmin: boolean;
  issueTrackerAuthInfo?: {
    uuid: string;
    emailAddress: string;
  };
}
