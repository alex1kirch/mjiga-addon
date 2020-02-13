import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/services/config.service';
import uuid from 'uuid/v1';
import fetch from 'node-fetch';
import IOauthService from '../../general/interfaces/IOauthService';
import * as jwt from 'jsonwebtoken';

export interface IMiroOauth {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  user_id: string;
  account_id: string;
}

interface IStatePayload {
  uuid: string;
  redirect_uri: string;
  data: any;
}

@Injectable()
export class MiroOauthService implements IOauthService<IMiroOauth> {
  private miroApp = this.config.miroAppInfo;

  constructor(private readonly config: ConfigService) {}

  auth(redirectPath: string, payload?: object): string {
    const oauthUrl = new URL(this.miroApp.oauthUrl);
    const redirectUri = new URL(
      redirectPath,
      this.config.localBaseUrl.href.replace(/([^/])$/, '$1/'),
    );

    const state = jwt.sign(
      { uuid: uuid(), redirect_uri: redirectUri.href, data: payload },
      this.config.jwtSecret,
    );

    oauthUrl.searchParams.append('response_type', 'code');
    oauthUrl.searchParams.append('client_id', this.miroApp.clientId);
    oauthUrl.searchParams.append('state', state);
    oauthUrl.searchParams.append('redirect_uri', redirectUri.href);

    return oauthUrl.href;
  }

  getPayloadFromState<T = any>(state: string): T {
    const token = jwt.verify(state, this.config.jwtSecret) as any;
    return token.data;
  }

  async exchange(
    code: string,
    state: string,
    verify: boolean = true,
  ): Promise<IMiroOauth> {
    try {
      const exchangeUrl = new URL(this.miroApp.exchangeUrl);
      let statePayload;

      if (verify) {
        statePayload = jwt.verify(
          state,
          this.config.jwtSecret,
        ) as IStatePayload;
      } else {
        statePayload = jwt.decode(state);
      }

      exchangeUrl.searchParams.append('grant_type', 'authorization_code');
      exchangeUrl.searchParams.append('client_id', this.miroApp.clientId);
      exchangeUrl.searchParams.append(
        'client_secret',
        this.miroApp.clientSecret,
      );
      exchangeUrl.searchParams.append(
        'redirect_uri',
        statePayload.redirect_uri,
      );
      exchangeUrl.searchParams.append('code', code);

      try {
        return (await fetch(exchangeUrl.href, {
          method: 'POST',
        })).json();
      } catch (e) {
        return Promise.reject(e);
      }
    } catch (e) {
      return Promise.reject('Incorrect State or OAuth session expired.');
    }
  }
}
