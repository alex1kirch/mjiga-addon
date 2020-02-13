import {
  Controller,
  Get,
  InternalServerErrorException,
  Req,
  Res,
} from '@nestjs/common';
import { MiroOauthRequest } from '../../miro/middlewares/miro-oauth.middleware';
import { Request, Response } from 'express';
// import { ConfigService } from '../../config/services/config.service';
import { Connection } from 'typeorm';

@Controller()
export class AddonController {
  constructor(
    //private readonly configSrv: ConfigService,
    private readonly dbConnection: Connection,
  ) {}

  @Get('install')
  async install(@Req() req: Request & MiroOauthRequest, @Res() res: Response) {
    //TODO: take oauth from miro and save token
    return 'Hello from install endpoint';
  }

  @Get('jira-callback')
  async jiraCallback() {
    //TODO: can be callback fro jira oauth
    return 'Hello from jira-callback endpoint';
  }

  @Get('ping/health-check')
  async healthCheck() {
    if (this.dbConnection.isConnected) {
      return { db: 'OK' };
    } else {
      throw new InternalServerErrorException('Db connection not established');
    }
  }
}
