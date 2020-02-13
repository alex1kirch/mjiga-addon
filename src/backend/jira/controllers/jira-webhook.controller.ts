import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '../../config/services/config.service';
import { MiroRestService } from '../../miro/services/miro-rest.service';
import fetch from 'node-fetch';
import { Response } from 'express';

function getCardUpdateInfoForIssue(issueId, statusTo) {}

@Controller('jira')
export class JiraWebhookController {
  constructor(
    private readonly miroRestSrv: MiroRestService,
    private readonly configSrv: ConfigService,
  ) {}

  @Post('webhook')
  async jiraBoardUpdated(@Body() payload: any) {
    console.log(payload.webhookEvent)
    if (payload.webhookEvent === 'jira:issue_updated') {
      const changelogItem = payload.changelog.items.find(item => item.field === 'status');
      console.log(changelogItem)
      if (changelogItem) {
        const updateInfo = getCardUpdateInfoForIssue(
          payload.issue.id,
          changelogItem.to,
        );
      }

      // await this.miroRestSrv.updateCard(
      //   this.configSrv.miroAppInfo.accessToken,
      //   updateInfo.boardId,
      //   updateInfo.widgetId,
      //   updateInfo.cardData,
      // );
    }

    return '';
  }

  @Get('image')
  async image(@Query('url') url: string, @Res() res: Response) {
    console.log(url)
    const imgRes = await fetch(url);
    console.log(imgRes.statusText);
    if (imgRes.ok) {
      const buffer = await imgRes.buffer();
      res.type(imgRes.headers.get('Content-Type'));
      res
        .append('Access-Control-Allow-Origin', '*')
        .status(200)
        .send(buffer);
    } else {
      res.status(500).send();
    }
  }
}
