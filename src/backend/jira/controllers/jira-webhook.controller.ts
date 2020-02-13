import { Controller, Post, Body } from '@nestjs/common';
import { ConfigService } from '../../config/services/config.service';
import { MiroRestService } from '../../miro/services/miro-rest.service';

function getCardUpdateInfoForIssue(issueId, statusTo) {

}

@Controller('/jira/webhook')
export class JiraWebhookController {
  constructor(
    private readonly miroRestSrv: MiroRestService,
    private readonly configSrv: ConfigService,
  ) {}

  @Post()
  async jiraBoardUpdated(@Body() payload: any) {
    const updateInfo = getCardUpdateInfoForIssue(
      payload.issue.id,
      payload.changelog.items.find(item => item.field === 'status').to,
    );

    await this.miroRestSrv.updateCard(
      this.configSrv.miroAppInfo.accessToken,
      "",
      "updateInfo.widgetId",
      null!,
    );
    console.log(payload);

    return '';
  }
}
