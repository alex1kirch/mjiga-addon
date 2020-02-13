import IssueLinkInfo from '../../../common/dto/IssueLinkInfo';
import IssueLinksCreationInfo from '../../../common/dto/IssueLinksCreationInfo';
import UserInfo from '../../../common/dto/UserInfo';
import InstallationInfo from '../../../common/dto/InstallationInfo';
import MsAuthEntryInfo from '../../../common/dto/MsAuthEntryInfo';
import AddonApiError from '../errors/addon-api.error';
import * as miro from '@miro/client-sdk';
import UnauthorizedError from '../errors/unauthorized.error';
import IssuesQueryParams from '../../../common/dto/IssuesQueryParams';
import PagedIssueInfo from '../../../common/dto/PagedIssuesInfo';

const API_ENDPOINT = `${location.origin}/api/v1`;

export default class AddonApiService {
  private miroToken: Promise<string>;

  constructor(
    private bearer?: string,
    errorsHandler?: (error: AddonApiError | UnauthorizedError) => void,
  ) {
    if (errorsHandler) {
      this.errorsHandler = errorsHandler;
    }
  }

  private errorsHandler(error: AddonApiError | UnauthorizedError) {
    miro.showErrorNotification(error.message);
  }

  private async getCommonHeaders() {
    if (!this.bearer) {
      try {
        if (!this.miroToken) {
          this.miroToken = miro.getToken();
        }
        this.bearer = await this.miroToken;
      } catch (e) {
        this.errorsHandler(new UnauthorizedError());
      }
    }

    return new Headers({
      Authorization: `Bearer ${this.bearer}`,
      Accept: 'application/json',
    });
  }

  private async processResponse(res: Response) {
    if (res.ok) {
      return res.json().catch(() => {
        this.errorsHandler(new AddonApiError());
      });
    } else {
      let errorInfo = void 0;
      try {
        errorInfo = await res.json();
      } finally {
        this.errorsHandler(new AddonApiError(errorInfo));
      }
    }
  }

  async createLinks(
    issueLinksInfo: IssueLinkInfo[],
  ): Promise<IssueLinksCreationInfo> {
    const methodUrl = `${API_ENDPOINT}/links`;

    const headers = await this.getCommonHeaders();
    headers.set('Content-Type', 'application/json');

    const methodResponse = await fetch(methodUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(issueLinksInfo),
    });

    return this.processResponse(methodResponse);
  }

  async getSelf(): Promise<UserInfo> {
    const methodUrl = `${API_ENDPOINT}/me`;

    const headers = await this.getCommonHeaders();

    const methodResponse = await fetch(methodUrl, {
      method: 'GET',
      headers,
    });

    return this.processResponse(methodResponse);
  }

  async getSettings(): Promise<InstallationInfo> {
    const methodUrl = `${API_ENDPOINT}/settings`;

    const headers = await this.getCommonHeaders();

    const methodResponse = await fetch(methodUrl, {
      method: 'GET',
      headers,
    });

    return this.processResponse(methodResponse);
  }

  async setInstance(instanceUrl: string): Promise<InstallationInfo> {
    const methodUrl = new URL(`${API_ENDPOINT}/instance`);
    methodUrl.searchParams.append('instanceUrl', instanceUrl);

    const headers = await this.getCommonHeaders();

    const methodResponse = await fetch(methodUrl.href, {
      method: 'POST',
      headers,
    });

    return this.processResponse(methodResponse);
  }

  async removeInstance(): Promise<InstallationInfo> {
    const methodUrl = `${API_ENDPOINT}/instance`;

    const headers = await this.getCommonHeaders();

    const methodResponse = await fetch(methodUrl, {
      method: 'DELETE',
      headers,
    });

    return this.processResponse(methodResponse);
  }

  async getMsAuthEntry(): Promise<MsAuthEntryInfo> {
    const methodUrl = `${API_ENDPOINT}/ms-auth-entry`;

    const headers = await this.getCommonHeaders();

    const methodResponse = await fetch(methodUrl, {
      method: 'GET',
      headers,
    });

    return this.processResponse(methodResponse);
  }

  async removeIssuesTrackerAuth(): Promise<UserInfo> {
    const methodUrl = `${API_ENDPOINT}/issues-tracker-auth`;
    const headers = await this.getCommonHeaders();

    const methodResponse = await fetch(methodUrl, {
      method: 'DELETE',
      headers,
    });

    return this.processResponse(methodResponse);
  }

  async getIssues(params: IssuesQueryParams): Promise<PagedIssueInfo> {
    const methodUrl = new URL(`${API_ENDPOINT}/issues`);
    Object.keys(params)
      .filter(k => params[k] !== null && params[k] !== undefined)
      .map(k => methodUrl.searchParams.append(k, params[k].toString()));
    const headers = await this.getCommonHeaders();

    const methodResponse = await fetch(methodUrl.href, {
      method: 'GET',
      headers,
    });

    return this.processResponse(methodResponse);
  }
}
