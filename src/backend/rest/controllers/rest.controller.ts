import { Body, Controller, Get, HttpService, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import {
  IJiraCardData,
  JiraServiceFake,
} from '../../jira/services/jiraService';
import { preprocessDirectives } from 'tslint/lib/verify/parse';

interface IWidgetData {
  widgetId: string;
  jiraIssueId: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  color: string;
  tags: string[];
}

@Controller('api/v1')
export class RestController {
  private readonly widgetIds: string[] = [];
  private readonly currentWidgets: IWidgetData[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly jiraService: JiraServiceFake,
  ) {}

  @Post('start')
  async start(@Req() req: Request, @Body() config: any): Promise<void> {
    if (this.widgetIds.length > 0) {
      return;
    }

    const inputWidgets = RestController.parseWidgetsData(config);
    inputWidgets.forEach(x => {
      this.widgetIds.push(x.widgetId);
      this.currentWidgets.push(x);
    });

    this.jiraService.initialize(config);

    setInterval(() => RestController.syncMiroToJira(this), 1000);
    return Promise.resolve();
  }

  private static async syncMiroToJira(context: RestController) {
    const boardId: string = 'o9J_kv2v8Bs=';
    const headers = {
      authorization: 'Bearer dd0976bb-24b8-45e0-b735-357354a5927e',
    };
    const observer = await context.httpService.get(
      'https://api.miro.com/v1/boards/' + boardId + '/widgets/',
      { headers: headers },
    );
    const result = await observer.toPromise();

    const cardWidgets = result.data.filter(x => x.type === 'card');
    const parsedMiroCardWidgets = cardWidgets
      .map(x => RestController.parseMiroCardWidget(x))
      .filter(x => !!x.widgetIds);

    const differenceWidgets = RestController.getDifferences(
      context,
      parsedMiroCardWidgets,
      context.currentWidgets,
    );

    await context.processDifferences(differenceWidgets);
  }

  private async processDifferences(
    differWidgets: IWidgetData[],
  ): Promise<void> {
    const jiraCards = differWidgets.map(x => RestController.widgetDataToJiraCardData(x))
    jiraCards.forEach(x => {
      try {
        this.jiraService.update(x)
      }
      catch (e) {
        console.log(e)
      }
    })
  }

  private static getDifferences(
    context: RestController,
    widgetsOnMiroBoard: IWidgetData[],
    oldWidgets: IWidgetData[],
  ): IWidgetData[] {
    const differWidgets : IWidgetData[] = [];
    widgetsOnMiroBoard.forEach((newItem) => {
      const oldIndex = oldWidgets.findIndex(x => x.widgetId === newItem.widgetId)
      if (oldIndex < 0) {
        return;
      }

      const oldItem = oldWidgets[oldIndex];
      const difference = RestController.compare(oldItem, newItem)
      differWidgets.push(difference)
    })

    return differWidgets
  }

  private static compare(source: IWidgetData, target: IWidgetData) : IWidgetData | null {
    if (source.status !== target.status ||
    source.description !== target.description ||
    source.assignee !== target.assignee ||
    source.color !== target.color ||
    source.priority !== target.priority ||
    source.summary !== target.summary ||
    source.tags !== target.tags) {

      return target;
    }
    else {
      return null;
    }
  }

  private static widgetDataToJiraCardData(
    widgetData: IWidgetData,
  ): IJiraCardData {
    const jiraCard: IJiraCardData = {
      description: widgetData.description,
      id: widgetData.jiraIssueId,
      status: widgetData.status,
      title: widgetData.summary,
    };
    return jiraCard;
  }

  private static parseMiroCardWidget(json: any): IWidgetData {
    const result: IWidgetData = {
      assignee: '',
      color: '',
      description: '',
      priority: '',
      status: '',
      summary: '',
      tags: [],
      widgetId: json.id,
      jiraIssueId: undefined,
    };
    return result;
  }

  private static parseWidgetsData(json: any): IWidgetData[] {
    var items = json['items'];
    return items.map(x => {
      const data: IWidgetData = {
        assignee: x.assigne,
        color: x.color,
        description: x.description,
        jiraIssueId: x.jiraIssueId,
        priority: x.priority,
        status: x.status,
        summary: x.summary,
        tags: [],
        widgetId: x.widgetId,
      };
      return data;
    });
  }
}
