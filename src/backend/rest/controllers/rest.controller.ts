import {
  Body,
  Controller,
  Get,
  HttpService,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { IJiraCardData, JiraService } from '../../jira/services/jiraService';

const DefaultMiroBoardID = 'o9J_k1IGnzo=';
const TOKEN = 'f672f733-b74c-4d77-9124-9ce187cd5480';
const MiroServerHost = "http://10.10.0.181:9114"
const SyncPeriod = 3000

interface IWidgetData {
  widgetId: string;
  columnId: string;
  subColumnId: string;
  summary: string;
  description: string;
}

interface SynchronizerConfig {
  miroBoardId: string;
  initialWidgets: IWidgetData[];
}

@Controller('api/v1')
export class RestController {
  private synchronizers: KanbanSynchronizer[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly jiraService: JiraService,
  ) {}

  @Get('test')
  async test(): Promise<string> {
    return 'Ok';
  }

  @Post('start')
  async start(@Res() res: Response, @Body() config: any): Promise<void> {
    const boardId = RestController.parseBoardId(config);
    const inputWidgets = RestController.parseWidgetsData(config);
    const syncConfig: SynchronizerConfig = {
      initialWidgets: inputWidgets,
      miroBoardId: boardId,
    };

    const newSynchronizer = new KanbanSynchronizer(syncConfig, this.httpService, this.jiraService)
    newSynchronizer.start(config, null!)
    this.synchronizers.push(newSynchronizer)

    // res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,HEAD');
    // res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.status(200).send();
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

  private static parseBoardId(json: any): string {
    if (json.boardId) {
      return json.boardId;
    } else {
      return DefaultMiroBoardID;
    }
  }

  private static format(value: string): string {
    return value ? value : '';
  }
}

class KanbanSynchronizer {
  private readonly miroBoardId: string;
  private readonly currentWidgets: IWidgetData[];
  private readonly widgetIds: string[]

  private syncHandler: NodeJS.Timeout;
  private started: boolean = false;
  private onDestroyedFunc: (sender: KanbanSynchronizer) => void;

  constructor(
    config: SynchronizerConfig,
    private readonly httpService: HttpService,
    private readonly jiraService: JiraService,
  ) {
    this.miroBoardId = config.miroBoardId;
    this.currentWidgets = config.initialWidgets;
    this.widgetIds = config.initialWidgets.map(x => x.widgetId)
  }

  public start(config: any, onDestroyed: (sender: KanbanSynchronizer) => void): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.onDestroyedFunc = onDestroyed;
    this.jiraService.initialize(config);
    this.syncHandler = setInterval(() => KanbanSynchronizer.syncMiroToJira(this), SyncPeriod);
  }

  public destroy(): void {
    clearInterval(this.syncHandler)
    if (this.onDestroyedFunc) {
      this.onDestroyedFunc(this)
    }
  }

  private static async syncMiroToJira(context: KanbanSynchronizer) {
    try {
      const boardId: string = context.miroBoardId;
      const headers = {
        authorization: 'Bearer ' + TOKEN,
      };
      const observer = await context.httpService.get(
        MiroServerHost + '/v1/boards/' + boardId + '/widgets/',
        { headers: headers },
      );
      const result = await observer.toPromise();

      const cardWidgets = result.data.data.filter(x => x.type === 'card');
      const parsedMiroCardWidgets = cardWidgets
        .map(x => KanbanSynchronizer.parseMiroCardWidget(x))
        .filter(x => x.widgetId);

      const onlyOwnedCards = parsedMiroCardWidgets.filter(x => context.widgetIds.includes(x.widgetId))
      if (onlyOwnedCards.length > 0){
        // CHECK DIFF

        const differenceWidgets = KanbanSynchronizer.getDifferences(
          context,
          onlyOwnedCards,
          context.currentWidgets,
        );

        await context.processDifferences(differenceWidgets);

        differenceWidgets.forEach(diff => {
          const index = context.currentWidgets.findIndex(
            x => x.widgetId === diff.widgetId,
          );
          if (index >= 0) {
            const item = context.currentWidgets[index];
            item.subColumnId = diff.subColumnId;
            item.columnId = diff.columnId;
            item.summary = diff.summary;
            item.description = diff.description;
          }
        });
      }
      else {
        context.destroy();
      }
    } catch (e) {
      console.log(e);
    }
  }

  private async processDifferences(
    differWidgets: IWidgetData[],
  ): Promise<void> {
    const jiraCards = differWidgets.map(x =>
      KanbanSynchronizer.widgetDataToJiraCardData(x),
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
    context: KanbanSynchronizer,
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
      const difference = KanbanSynchronizer.compare(oldItem, newItem);
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

  private static parseMiroCardWidget(
    json: any,
  ): IWidgetData | { widgetId: string } {
    if (!json.kanbanNode) {
      return { widgetId: undefined }!;
    }
    const result: IWidgetData = {
      columnId: KanbanSynchronizer.format(json.kanbanNode.column),
      description: KanbanSynchronizer.format(json.description),
      subColumnId: KanbanSynchronizer.format(json.kanbanNode.subColumn),
      summary: KanbanSynchronizer.format(json.title),
      widgetId: KanbanSynchronizer.format(json.id),
    };
    return result;
  }

  private static format(value: string): string {
    return value ? value : '';
  }
}
