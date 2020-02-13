import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { IMiroOauth, MiroOauthService } from '../services/miro-oauth.service';

export interface MiroOauthRequest {
  miroOauth: IMiroOauth;
}

@Injectable()
export class MiroOauthMiddleware implements NestMiddleware {
  constructor(private readonly oauthService: MiroOauthService) {}

  use(req: Request & MiroOauthRequest, res: Response, next: () => void) {
    const code = req.query.code;
    let state = req.query.state;
    if (state instanceof Array) {
      state = state[0];
    }

    if (code && state) {
      this.oauthService.exchange(code, state).then(
        oauthResult => {
          req.miroOauth = oauthResult;
          next();
        },
        e => {
          throw new Error(`Miro token exchange error: ${e}`);
        },
      );
    } else {
      res.redirect(this.oauthService.auth(req.originalUrl));
    }
  }
}
