import { Injectable } from '@nestjs/common';

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
  private currentConfig: any;
  initialize(config: any) {
    this.currentConfig = config;
  }

  update(item: IJiraCardData) {}

  getCardUpdateInfoForIssue(
    issueId: string,
    toStatus: string,
  ): { boardId: string; widgetId: string; cardJson: any } {
    const statusMap = this.currentConfig.metadata['3074457345621789607']
      .statusIdToKanbanColumnIdMap[toStatus];
    const newColumnId = statusMap.columnId;
    const newSubColumnId = statusMap.subColumnId;
    return {
      boardId: 'o9J_k1IGnzo=',
      widgetId: this.currentConfig.items.find(item => item.jiraIssueId === issueId).widgetId,
      cardJson: {
        kanbanNode: {
          column: newColumnId,
          subColumn: newSubColumnId
        }
      },
    };
  }
}
