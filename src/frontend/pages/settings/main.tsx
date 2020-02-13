import '../../common/styles/base.scss';
import * as miro from '@miro/client-sdk';
import AddonApiService from '../../common/services/addon-api.service';
import SetupForm from './setup-form.component';
import InstallationInfo from '../../../common/dto/InstallationInfo';
import React from 'react';
import ReactDOM from 'react-dom';
import UserInfo from '../../../common/dto/UserInfo';
import { AZURE_OAUTH_COMPLETE } from '../../common/messages/consts';

const appRoot = document.getElementById('root');
const origin = location.origin;
let apiSrv: AddonApiService;

async function onUserAuthorize() {
  return apiSrv
    .getMsAuthEntry()
    .then(authEntry => {
      return new Promise(resolve => {
        const oauthCompleteListener = (e: MessageEvent) => {
          if (e.origin === origin && e.data.name === AZURE_OAUTH_COMPLETE) {
            window.removeEventListener('message', oauthCompleteListener);
            resolve();
          }
        };

        window.addEventListener('message', oauthCompleteListener);
        window.open(
          authEntry.oauthUrl,
          '_blank',
          'width=450,height=650,left=500,top=500,menubar=0,toolbar=0',
        );
      });
    })
    .then(() => apiSrv.getSelf());
}

async function onFetchSettings(): Promise<InstallationInfo> {
  return apiSrv.getSettings();
}

async function onUserDisconnect(): Promise<UserInfo> {
  return apiSrv.removeIssuesTrackerAuth();
}

async function onOrganizationConnect(
  instanceUrl: string,
): Promise<InstallationInfo> {
  return apiSrv.setInstance(instanceUrl);
}

async function onOrganizationDisconnect() {
  return apiSrv.removeInstance();
}

function showSetupForm(user: UserInfo) {
  ReactDOM.render(
    <SetupForm
      user={user}
      onFetchSettings={onFetchSettings}
      onUserDisconnect={onUserDisconnect}
      onUserAuthorize={onUserAuthorize}
      onOrganizationConnect={onOrganizationConnect}
      onOrganizationDisconnect={onOrganizationDisconnect}
    />,
    appRoot,
  );
}

function showNotInstalledInfo() {
  ReactDOM.render(<div>NO AUTH</div>, appRoot);
}

function showBetaBeBeta() {
  ReactDOM.render(<div>NO AUTH</div>, appRoot);
}

miro.onReady(() => {
  miro.initializeSettings({ iframeHeight: 190 });
  miro.getToken().then(
    async token => {
      if (token) {
        apiSrv = new AddonApiService(token);
        try {
          const user = await apiSrv.getSelf();
          showSetupForm(user);
        } catch (e) {
          showBetaBeBeta();
        }
      } else {
        showNotInstalledInfo();
      }
    },
    () => showNotInstalledInfo(),
  );
});
