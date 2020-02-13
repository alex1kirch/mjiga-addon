import { Body, Controller, Get, HttpService, Req } from '@nestjs/common';
import { Request } from 'express';
import { JiraServiceFake } from '../../jira/services/jiraService';

interface ICardWidget {
  id: string;
}

@Controller('api/v1')
export class RestController {
  private readonly widgets: ICardWidget[] = [];

  constructor(private readonly httpService: HttpService, private readonly jiraService: JiraServiceFake) {}

  @Get('start')
  async start(
    @Req() req: Request,
    @Body() createdWidgets: ICardWidget[],
  ): Promise<void> {
    if (this.widgets.length > 0) {
      return;
    }

    createdWidgets.forEach(x => this.widgets.push(x));

    setInterval(() => RestController.syncMiroToJira(this), 500);
    return Promise.resolve();
  }

  private static async syncMiroToJira(context: RestController) {
    const boardId: string = 'o9J_kv2v8Bs=';
    const headers = {
      authorization: 'Bearer dd0976bb-24b8-45e0-b735-357354a5927e',
    }
    const observer = await context.httpService.get(
      'https://api.miro.com/v1/boards/' + boardId + '/widgets/',
      { headers: headers },
    );
    const result = await observer.toPromise();

  }
}
