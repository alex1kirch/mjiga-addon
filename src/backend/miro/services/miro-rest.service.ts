import { Injectable } from '@nestjs/common';
import fetch, { Response } from 'node-fetch';
import IssueInfo from '../../../common/dto/IssueInfo';
import { ConfigService } from '../../config/services/config.service';
import issueInfoToMiroCardData from '../../../common/utils/issueInfoToMiroCardData';
import RestCollectionFragment from '../general/interfaces/RestCollectionFragment';
import TeamUserConnection from '../general/interfaces/TeamUserConnection';

@Injectable()
export class MiroRestService {
  private readonly apiUrl = this.config.miroAppInfo.apiUrl;

  constructor(private readonly config: ConfigService) {}

  private async fetchRestResponse(
    accessToken: string,
    method: string,
    pathOrUrl: string,
    bodyObj?: object,
  ): Promise<Response> {
    const restUrl = new URL(pathOrUrl, this.apiUrl);
    console.log(restUrl.href);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    };
    let body: string | undefined = undefined;
    if (bodyObj) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(bodyObj);
    }
    return fetch(restUrl.href, { method, headers, body });
  }

  private async fetchRestJson<T>(
    accessToken: string,
    method: string,
    pathOrUrl: string,
    bodyObj?: object,
  ): Promise<T> {
    const result = await this.fetchRestResponse(
      accessToken,
      method,
      pathOrUrl,
      bodyObj,
    );
    if (result.ok) {
      try {
        return (await result.json()) as T;
      } catch (e) {
        throw e;
      }
    } else {
      const errorText = await result.text();
      throw new Error(errorText);
    }
  }

  /**
   * Return AsyncIterableIterator for Miro objects in pagination flow. Automatically make request to Miro REST API when iterator need next fragment.
   * About Miro pagination see: https://developers.miro.com/reference#pagination
   * @param accessToken
   * @param path
   * @param limit
   */
  async *getCollection<T extends any = any>(
    accessToken: string,
    path: string,
    limit: number = 100,
  ): AsyncIterableIterator<T> {
    const collectionUrl = new URL(path, this.apiUrl);
    collectionUrl.searchParams.append('limit', limit.toString());

    try {
      let fragment = await this.fetchRestJson<RestCollectionFragment<T>>(
        accessToken,
        'GET',
        collectionUrl.href,
      );
      while (true) {
        for (let i = 0; i < fragment.data.length; i++) {
          yield fragment.data[i];
        }

        if (fragment.nextLink) {
          fragment = await this.fetchRestJson<RestCollectionFragment<T>>(
            accessToken,
            'GET',
            fragment.nextLink,
          );
        } else {
          return;
        }
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Find connection for target user and return true if role === 'admin'
   * @param user
   */
  async isTeamAdmin(accessToken: string): Promise<boolean> {
    const connection = await this.fetchRestJson<TeamUserConnection>(
      accessToken,
      'GET',
      `teams/:accountId:/user-connections/me`, //TODO: accountId
    );

    return connection.role === 'admin';
  }

  /**
   * Try to update Miro card by issue info
   * @param user User, on behalf of update will be done
   * @param boardId Board, that contains widget which need to update
   * @param widgetId Target card-widget
   * @param issueInfo Issue info
   */
  async updateCard(
    accessToken: string,
    boardId: string,
    widgetId: string,
    cardData: any,
  ): Promise<Response> {
    return this.fetchRestResponse(
      accessToken,
      'PATCH',
      `boards/${boardId}/widgets/${widgetId}`,
      cardData,
    );
  }
}
