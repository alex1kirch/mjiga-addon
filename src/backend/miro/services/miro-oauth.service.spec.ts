import { Test } from '@nestjs/testing';
import { IMiroOauth, MiroOauthService } from './miro-oauth.service';
import { ConfigService } from '../../config/services/config.service';
import { mocked } from 'ts-jest/utils';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { escape } from 'querystring';

jest.mock('jsonwebtoken');
jest.mock('node-fetch');
const mockedJwt = mocked(jwt);
const mockedFetch = mocked(fetch);
const { Response } = jest.requireActual('node-fetch');

describe('MiroOauthService', () => {
  let miroOauthSrv: MiroOauthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MiroOauthService,
        {
          provide: ConfigService,
          useValue: {
            localBaseUrl: new URL('https://test.com'),
            jwtSecret: 'somesecret',
            miroAppInfo: {
              oauthUrl: 'https://test-miro.com/oauth',
              exchangeUrl: 'https://test-miro.com/exchange',
              clientId: 'someclientid',
              clientSecret: 'someClientSecret',
            },
          },
        },
      ],
    }).compile();

    miroOauthSrv = module.get<MiroOauthService>(MiroOauthService);
    mockedJwt.verify.mockReset();
    mockedJwt.sign.mockReset();
    mockedFetch.mockReset();
  });

  it('Should return configured miro oauth url with signed state and specified redirect path', () => {
    //@ts-ignore
    mockedJwt.sign.mockReturnValue('jwtstate');

    const authUrl = miroOauthSrv.auth('install', {});
    expect(mockedJwt.sign.mock.calls.length).toBe(1);
    expect(authUrl).toBe(
      `https://test-miro.com/oauth?response_type=code&client_id=someclientid&state=jwtstate&redirect_uri=${escape(
        'https://test.com/install',
      )}`,
    );
  });

  it('Should resolve exchange if state verified', async () => {
    const exchangeResponse: IMiroOauth = {
      access_token: 'accessToken',
      token_type: 'Bearer',
      scope: 'some:scope',
      user_id: '123',
      account_id: '456',
    };

    //@ts-ignore
    mockedJwt.verify.mockReturnValueOnce({
      payload: 'payload',
      redirect_uri: 'uri',
    });
    mockedFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(exchangeResponse)),
    );

    const exchangeResult = miroOauthSrv.exchange('somecode', 'somestate');
    expect(mockedJwt.verify.mock.calls.length).toBe(1);
    expect(mockedFetch.mock.calls.length).toBe(1);
    expect(mockedFetch.mock.calls[0][0]).toBe(
      'https://test-miro.com/exchange?grant_type=authorization_code&client_id=someclientid&client_secret=someClientSecret&redirect_uri=uri&code=somecode',
    );
    expect.assertions(4);
    await expect(exchangeResult).resolves.toEqual(exchangeResponse);
  });

  it('Should reject exchange if state not verified', async () => {
    //@ts-ignore
    mockedJwt.verify.mockImplementationOnce(() => {
      throw new Error('Verify error');
    });

    const exchangeResult = miroOauthSrv.exchange('somecode', 'somesecret');
    expect(mockedJwt.verify.mock.calls.length).toBe(1);
    expect(mockedFetch.mock.calls.length).toBe(0);
    expect.assertions(3);
    await expect(exchangeResult).rejects.toBe(
      'Incorrect State or OAuth session expired.',
    );
  });
});
