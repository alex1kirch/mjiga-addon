import { HttpService, Injectable } from '@nestjs/common';
import { IJiraCardData, JiraService } from '../../jira/services/jiraService';

const TOKEN = 'f672f733-b74c-4d77-9124-9ce187cd5480';
const MiroServerHost = 'http://10.10.0.181:9114';
const SyncPeriod = 3000;

@Injectable()
export class KanbanSynchronizersService {
  private synchronizers: KanbanSynchronizer[] = [];

  constructor(private readonly httpService: HttpService,
              private readonly jiraService: JiraService,) {

  }

  public addKanbanBoard(config: SynchronizerConfig){
    const newSynchronizer = new KanbanSynchronizer(
      config.jiraBoardId,
      config,
      this.httpService,
      this.jiraService,
    );
    newSynchronizer.start(config.rawData, (sender: KanbanSynchronizer) => {
      const index = this.synchronizers.indexOf(sender);
      if (index >= 0){
        this.synchronizers.splice(index, 1)
      }
    });
    this.synchronizers.push(newSynchronizer);
  }

  public onJiraAddCard(syncId: string, card: IJiraCardData){
    const targetIndex = this.synchronizers.findIndex(x => x.syncId === syncId)
    if (targetIndex >= 0){
      const syncronizer = this.synchronizers[targetIndex];
      syncronizer.addWidget(card);
    }
  }

  public onJiraRemoveCard(syncId: string, widgetId: string) {
    const targetIndex = this.synchronizers.findIndex(x => x.syncId === syncId)
    if (targetIndex >= 0){
      const syncronizer = this.synchronizers[targetIndex];
      syncronizer.removeWidget(widgetId);
    }
  }

}

export interface IWidgetData {
  widgetId: string;
  columnId: string;
  subColumnId: string;
  summary: string;
  description: string;
}

export interface SynchronizerConfig {
  miroBoardId: string;
  jiraBoardId: string;
  initialWidgets: IWidgetData[];
  rawData: any
}


class KanbanSynchronizer {
  private readonly miroBoardId: string;
  private readonly currentWidgets: IWidgetData[];
  private readonly widgetIds: string[];

  private syncHandler: NodeJS.Timeout;
  private started: boolean = false;
  private onDestroyedFunc: (sender: KanbanSynchronizer) => void;

  constructor(
    public readonly syncId: string,
    config: SynchronizerConfig,
    private readonly httpService: HttpService,
    private readonly jiraService: JiraService,
  ) {
    this.miroBoardId = config.miroBoardId;
    this.currentWidgets = config.initialWidgets;
    this.widgetIds = config.initialWidgets.map(x => x.widgetId);
  }

  public start(
    config: any,
    onDestroyed: (sender: KanbanSynchronizer) => void,
  ): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.onDestroyedFunc = onDestroyed;
    this.jiraService.initialize(config);
    this.syncHandler = setInterval(
      () => KanbanSynchronizer.syncMiroToJira(this),
      SyncPeriod,
    );
  }

  public destroy(): void {
    clearInterval(this.syncHandler);
    if (this.onDestroyedFunc) {
      this.onDestroyedFunc(this);
    }
  }

  public addWidget(card: IJiraCardData) {
    if (card) {
      const widgetData = KanbanSynchronizer.jiraCardToWidgetData(card);
      if (widgetData.widgetId) {
        this.currentWidgets.push(widgetData);
        this.widgetIds.push(widgetData.widgetId);
      }
    }
  }

  public removeWidget(widgetId: string) {
    if (widgetId) {
      const idIndex = this.widgetIds.indexOf(widgetId);
      if (idIndex >= 0){
        this.widgetIds.splice(idIndex, 1);
      }
      const widgetIndex = this.currentWidgets.findIndex(x => x.widgetId === widgetId)
      if (widgetIndex >= 0){
        this.currentWidgets.splice(widgetIndex, 1);
      }
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

      const onlyOwnedCards = parsedMiroCardWidgets.filter(x =>
        context.widgetIds.includes(x.widgetId),
      );
      if (onlyOwnedCards.length > 0) {
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
      } else {
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

  private static jiraCardToWidgetData(jiraCard: IJiraCardData): IWidgetData {
    const result: IWidgetData = {
      columnId: KanbanSynchronizer.format(jiraCard.columnId),
      description: KanbanSynchronizer.format(jiraCard.columnId),
      subColumnId: KanbanSynchronizer.format(jiraCard.columnId),
      summary: KanbanSynchronizer.format(jiraCard.columnId),
      widgetId: KanbanSynchronizer.format(jiraCard.columnId),
    };
    return result;
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