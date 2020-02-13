import React from 'react';
import s from './style.scss';
import UserInfo from '../../../../common/dto/UserInfo';
import InstallationInfo from '../../../../common/dto/InstallationInfo';
import AddonApiError from '../../../common/errors/addon-api.error';
import { ErrorCode } from '../../../../common/enums';
import * as miro from '@miro/client-sdk';

interface IProps {
  user: UserInfo;
  onFetchSettings: () => Promise<InstallationInfo>;
  onUserAuthorize: (user: UserInfo) => Promise<UserInfo>;
  onUserDisconnect: (user: UserInfo) => Promise<UserInfo>;
  onOrganizationConnect: (orgUrl: string) => Promise<InstallationInfo>;
  onOrganizationDisconnect: (orgUrl: string) => Promise<InstallationInfo>;
}

interface IState {
  user: UserInfo;
  settings: InstallationInfo | null;
  orgConnectionPending: boolean;
  errorState: {
    isError: boolean;
    msg: string;
  };
}

export default class SetupForm extends React.PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      settings: null,
      orgConnectionPending: false,
      errorState: { isError: false, msg: '' },
    };
  }

  componentDidMount(): void {
    this.props
      .onFetchSettings()
      .then(
        settings => this.setState({ settings }),
        msg => this.setState({ errorState: { isError: true, msg } }),
      );
  }

  onOrgUrlChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      settings: { ...this.state.settings!, instanceUrl: e.target.value },
    });
  };

  onMsUserBtnClicked = async () => {
    const { user } = this.state;
    const authorized = !!user.issueTrackerAuthInfo;
    let userInfo = await (authorized
      ? this.props.onUserDisconnect(user)
      : this.props.onUserAuthorize(user));

    this.setState({ user: userInfo });
    miro.showNotification(authorized ? 'Disconnected' : 'Connected');
  };

  onOrganizationSetupBtnClicked = async () => {
    const { settings, user } = this.state;
    const orgConnected = !!settings!.serviceHooks.length;
    this.setState({ orgConnectionPending: true });
    try {
      const newSettings = await (orgConnected
        ? this.props.onOrganizationDisconnect(this.state.settings!.instanceUrl)
        : this.props.onOrganizationConnect(this.state.settings!.instanceUrl));
      this.setState({ settings: newSettings, orgConnectionPending: false });
      miro.showNotification(orgConnected ? 'Disconnected' : 'Connected');
    } catch (e) {
      this.setState({ orgConnectionPending: false });
      if (
        e instanceof AddonApiError &&
        e.errorInfo.code === ErrorCode.AZURE_SERVICE_HOOK_ERROR
      ) {
        miro.showErrorNotification(
          `${e.message} The user ${
            user.issueTrackerAuthInfo!.emailAddress
          } is not an  Organization Owner. Please ask your Organization Owner to configure this step.`,
        );
      } else {
        throw e;
      }
    }
  };

  private renderError() {
    if (this.state.errorState.isError) {
      return (
        <div className={`${s.settingsForm__error}`}>
          {`Something went wrong: ${this.state.errorState.msg}`}
        </div>
      );
    } else {
      return false;
    }
  }

  private renderUserInfo() {
    const { user } = this.state;
    const isConnected = !!user.issueTrackerAuthInfo;
    const authBtnCaption = isConnected ? 'Disconnect' : 'Connect';
    let authBtnClass = `${s.btn} ${s.field__btn} ${
      isConnected ? s.btn_secondary : s.btn_primary
    }`;

    return (
      <div>
        <div className={`${s.settingsForm__field} ${s.field}`}>
          <div className={`${s.field__control} ${s.labeledInput}`}>
            {isConnected && (
              <label className={`${s.labeledInput__label}`}>
                {isConnected ? 'Microsoft account' : ''}
              </label>
            )}
            <input
              className={`${s.input} ${s.labeledInput__input}`}
              placeholder="Microsoft account"
              type="text"
              readOnly={true}
              value={isConnected ? user.issueTrackerAuthInfo!.emailAddress : ''}
            />
          </div>
          <button className={authBtnClass} onClick={this.onMsUserBtnClicked}>
            {authBtnCaption}
          </button>
        </div>
      </div>
    );
  }

  private renderAdminSettings() {
    const { settings, user, orgConnectionPending } = this.state;
    const isConnected = !!user.issueTrackerAuthInfo;
    const orgConnected = !!settings!.serviceHooks.length;
    let orgBtnClass = `${s.btn} ${s.field__btn} ${
      orgConnected ? s.btn_secondary : s.btn_primary
    }`;
    if (orgConnectionPending) {
      orgBtnClass += ` ${s.btn_loading}`;
    }

    return (
      <div>
        <div className={`${s.settingsForm__field} ${s.field}`}>
          <div className={`${s.field__control} ${s.labeledInput}`}>
            <label className={`${s.labeledInput__label}`}>
              Connect your Azure Organization with Miro
            </label>
            <input
              className={`${s.input} ${s.labeledInput__input}`}
              type="text"
              placeholder="https://dev.azure.com/example/"
              disabled={!isConnected}
              readOnly={orgConnected || !user.isAdmin || orgConnectionPending}
              value={settings!.instanceUrl}
              onChange={this.onOrgUrlChanged}
            />
          </div>
          <button
            className={orgBtnClass}
            onClick={this.onOrganizationSetupBtnClicked}
            disabled={!isConnected || !user.isAdmin}
          >
            {orgConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>
    );
  }

  private renderSettings() {
    if (this.state.settings === null) {
      return <div>Loading...</div>;
    } else {
      return (
        <React.Fragment>
          <div className={s.settingsForm__caption}>App settings</div>
          {this.renderUserInfo()}
          {this.renderAdminSettings()}
        </React.Fragment>
      );
    }
  }

  render() {
    return (
      <div className={`${s.settingsForm}`}>
        {this.renderError() || this.renderSettings()}
      </div>
    );
  }
}
