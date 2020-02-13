import { Test } from '@nestjs/testing';
import { mocked } from 'ts-jest/utils';
import fetch from 'node-fetch';
import { MiroRestService } from './miro-rest.service';
import { ConfigService } from '../../config/services/config.service';
import RestCollectionFragment from '../general/interfaces/RestCollectionFragment';
import { User } from '../../database/entities/user.entity';

jest.mock('node-fetch');
const mockedFetch = mocked(fetch);
const { Response } = jest.requireActual('node-fetch');

describe('MiroRestService', () => {
  let miroRestSrv: MiroRestService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MiroRestService,
        {
          provide: ConfigService,
          useValue: {
            miroAppInfo: {
              apiUrl: 'https://testmiroapi.com',
            },
          },
        },
      ],
    }).compile();

    miroRestSrv = module.get<MiroRestService>(MiroRestService);
    mockedFetch.mockReset();
  });

  it('Should find collection item with index === 7', async () => {
    const testUser: User = new User();
    testUser.accessToken = 'testAccessToken';

    const collectionPath = 'test/path/to/rest/collection';
    const collectionFragment1: RestCollectionFragment = {
      type: 'list',
      offset: 0,
      limit: 3,
      size: 9,
      nextLink: `https://testmiroapi.com/${collectionPath}?offset=3&limit=3`,
      prevLink: null,
      data: [{ index: 0 }, { index: 1 }, { index: 2 }],
    };
    const collectionFragment2: RestCollectionFragment = {
      type: 'list',
      offset: 3,
      limit: 3,
      size: 9,
      nextLink: `https://testmiroapi.com/${collectionPath}?offset=6&limit=3`,
      prevLink: `https://testmiroapi.com/${collectionPath}?offset=0&limit=3`,
      data: [{ index: 3 }, { index: 4 }, { index: 5 }],
    };
    const collectionFragment3: RestCollectionFragment = {
      type: 'list',
      offset: 6,
      limit: 3,
      size: 9,
      nextLink: null,
      prevLink: `https://testmiroapi.com/${collectionPath}?offset=6&limit=3`,
      data: [{ index: 6 }, { index: 7 }, { index: 8 }],
    };

    mockedFetch
      .mockResolvedValueOnce(new Response(JSON.stringify(collectionFragment1)))
      .mockResolvedValueOnce(new Response(JSON.stringify(collectionFragment2)))
      .mockResolvedValueOnce(new Response(JSON.stringify(collectionFragment3)));

    const collection = miroRestSrv.getCollection<{ index: number }>(
      testUser,
      collectionPath,
      3,
    );
    expect.assertions(5);

    for await (let item of collection) {
      if (item.index === 7) {
        expect(mockedFetch.mock.calls.length).toBe(3);
        expect(mockedFetch.mock.calls[0][0]).toBe(
          `https://testmiroapi.com/${collectionPath}?limit=3`,
        );
        expect(mockedFetch.mock.calls[1][0]).toBe(collectionFragment1.nextLink);
        expect(mockedFetch.mock.calls[2][0]).toBe(collectionFragment2.nextLink);
        expect(item).toEqual(collectionFragment3.data[1]);
        break;
      }
    }
  });
});
