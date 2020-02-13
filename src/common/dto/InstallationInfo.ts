import ServiceHookInfo from './ServiceHookInfo';

export default interface InstallationInfo {
  installationId: string;
  instanceUrl: string;
  serviceHooks: ServiceHookInfo[];
}
