import { Injectable } from '@nestjs/common';
import { KanbanService } from '../../database/services/kanban.service';
import { Kanban } from '../../database/entities/kanban.entity';

export interface IJiraCardData {
  widgetId: string;
  columnId: string;
  subColumnId: string;
  summary: string;
  description: string;
}

export interface IJiraService {
  initialize(config: any);

  update(item: IJiraCardData);
}

@Injectable()
export class JiraService implements IJiraService {
  constructor(private readonly kanbanSrv: KanbanService) {}

  private currentConfig: any;
  initialize(config: any) {
    this.currentConfig = config;
    this.kanbanSrv.push(config)
  }

  update(item: IJiraCardData) {
    console.log("update")
  }

  async getCardUpdateInfoForIssue(
    issueId: string,
    toStatus: string,
  ):Promise<{ boardId: string; widgetId: string; cardJson: any }[]> {
    const kanbans = await this.kanbanSrv.getAll() as Kanban[];
    kanbans.forEach((kb) => {
      const kbJson = JSON.parse(kb.json)
    });
    const statusMap = this.currentConfig.metadata['3074457345621789607']
      .statusIdToKanbanColumnIdMap[toStatus];
    const newColumnId = statusMap.columnId;
    const newSubColumnId = statusMap.subColumnId;
    return {
      boardId: 'o9J_k1IGnzo=',
      widgetId: this.currentConfig.items.find(item => item.jiraIssueId == issueId).widgetId,
      cardJson: {
        kanbanNode: {
          column: newColumnId,
          subColumn: newSubColumnId
        }
      },
    };
  }
}
