import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  IWidgetData,
  KanbanSynchronizersService,
  SynchronizerConfig,
} from '../Services/KanbanSynchronizersService';

const DefaultMiroBoardID = 'o9J_k1IGnzo=';

@Controller('api/v1')
export class RestController {
  constructor(private readonly syncService: KanbanSynchronizersService) {}

  @Get('test')
  async test(): Promise<string> {
    return 'Ok';
  }

  @Post('start')
  async start(@Res() res: Response, @Body() config: any): Promise<void> {
    const boardId = RestController.parseBoardId(config);
    const jiraBoardID = RestController.parseJiraBoardId(config);
    const inputWidgets = RestController.parseWidgetsData(config);
    const syncConfig: SynchronizerConfig = {
      jiraBoardId: jiraBoardID,
      initialWidgets: inputWidgets,
      miroBoardId: boardId,
    };

    this.syncService.addKanbanBoard(syncConfig);

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

  private static parseJiraBoardId(json: any): string {
    if (json.id) {
      return json.id;
    } else {
      return 'fakeJiraID';
    }
  }

  private static format(value: string): string {
    return value ? value : '';
  }
}
