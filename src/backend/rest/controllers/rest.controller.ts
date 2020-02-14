import { Body, Controller, Get, HttpService, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  IJiraCardData,
  JiraService,
} from '../../jira/services/jiraService';

interface IWidgetData {
  widgetId: string;
  columnId: string;
  subColumnId: string;
  summary: string;
  description: string;
}

@Controller('api/v1')
export class RestController {
  private readonly widgetIds: string[] = [];
  private readonly currentWidgets: IWidgetData[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly jiraService: JiraService,
  ) {}

  @Get('test')
  async test() : Promise<string> {
    return "Ok";
  }

  @Post('start')
  async start(@Res() res: Response, @Body() config: any): Promise<void> {
    if (this.widgetIds.length > 0) {
      return;
    }

    const inputWidgets = RestController.parseWidgetsData(config);
    inputWidgets.forEach(x => {
      this.widgetIds.push(x.widgetId);
      this.currentWidgets.push(x);
    });

    this.jiraService.initialize(config);

    RestController.syncMiroToJira(this)

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.status(200).send();

    setInterval(() => RestController.syncMiroToJira(this), 1000);
  }

  private static async syncMiroToJira(context: RestController) {
    try {
      const boardId: string = 'o9J_k1IGnzo=';
      const token: string = 'f672f733-b74c-4d77-9124-9ce187cd5480';
      const headers = {
        authorization: 'Bearer ' + token,
      };
      const observer = await context.httpService.get(
        'http://10.10.0.181:9114/v1/boards/' + boardId + '/widgets/',
        { headers: headers },
      );
      const result = await observer.toPromise();

      const cardWidgets = result.data.data.filter(x => x.type === 'card');
      const parsedMiroCardWidgets = cardWidgets
        .map(x => RestController.parseMiroCardWidget(x))
        .filter(x => x.widgetId);

      const differenceWidgets = RestController.getDifferences(
        context,
        parsedMiroCardWidgets,
        context.currentWidgets,
      );

      await context.processDifferences(differenceWidgets);

      differenceWidgets.forEach(diff => {
        const index = context.currentWidgets.findIndex(x => x.widgetId === diff.widgetId);
        if (index >= 0){
          const item = context.currentWidgets[index];
          item.subColumnId = diff.subColumnId
          item.columnId = diff.columnId;
          item.summary = diff.summary;
          item.description = diff.description;
        }
      })
    }
    catch (e) {
      console.log(e)
    }
  }

  private async processDifferences(
    differWidgets: IWidgetData[],
  ): Promise<void> {
    const jiraCards = differWidgets.map(x =>
      RestController.widgetDataToJiraCardData(x),
    );
    jiraCards.forEach(x => {
      try {
        this.jiraService.update(x);
      } catch (e) {
        console.log(e);
      }
    });
  }

  private static getDifferences(
    context: RestController,
    widgetsOnMiroBoard: IWidgetData[],
    oldWidgets: IWidgetData[],
  ): IWidgetData[] {
    const differWidgets: IWidgetData[] = [];
    widgetsOnMiroBoard.forEach(newItem => {
      const oldIndex = oldWidgets.findIndex(
        x => x.widgetId === newItem.widgetId,
      );
      if (oldIndex < 0) {
        return;
      }

      const oldItem = oldWidgets[oldIndex];
      const difference = RestController.compare(oldItem, newItem);
      if (difference) {
        differWidgets.push(difference);
      }
    });

    return differWidgets;
  }

  private static compare(
    source: IWidgetData,
    target: IWidgetData,
  ): IWidgetData | null {
    if (
      source.description !== target.description ||
      source.summary !== target.summary ||
      source.columnId !== target.columnId ||
      source.subColumnId !== target.subColumnId
    ) {
      return target;
    } else {
      return null;
    }
  }

  private static widgetDataToJiraCardData(
    widgetData: IWidgetData,
  ): IJiraCardData {
    const jiraCard: IJiraCardData = {
      columnId: widgetData.columnId,
      subColumnId: widgetData.subColumnId,
      summary: widgetData.summary,
      widgetId: widgetData.widgetId,
      description: widgetData.description,
    };
    return jiraCard;
  }

  private static parseMiroCardWidget(json: any): IWidgetData | {widgetId: string} {
    if (!json.kanbanNode){
      return {widgetId: undefined}!
    }
    const result: IWidgetData = {
      columnId: RestController.format(json.kanbanNode.column),
      description: RestController.format(json.description),
      subColumnId: RestController.format(json.kanbanNode.subColumn),
      summary: RestController.format(json.title),
      widgetId: RestController.format(json.id),
    };
    return result;
  }

  private static parseWidgetsData(json: any): IWidgetData[] {
    var items = json['items'];
    return items.map(x => {
      const data: IWidgetData = {
        description: RestController.format(x.description),
        summary: RestController.format(x.summary),
        widgetId: RestController.format(x.widgetId),
        columnId: RestController.format(x.columnId),
        subColumnId: RestController.format(x.subColumnId),
      };
      return data;
    });
  }

  private static format(value: string) : string {
    return value ? value : ""
  }
}
