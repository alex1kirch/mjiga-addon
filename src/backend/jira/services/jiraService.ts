import { Injectable } from '@nestjs/common';
import { KanbanService } from '../../database/services/kanban.service';
import { Kanban } from '../../database/entities/kanban.entity';
import fetch from 'node-fetch';
import { ConfigService } from '../../config/services/config.service';
import { OAuth } from 'oauth';

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
  private oauth: OAuth;

  constructor(
    private readonly kanbanSrv: KanbanService,
    private readonly configSrv: ConfigService,
  ) {
    const jira = this.configSrv.jiraInfo;
    this.oauth = new OAuth(
      jira.host + jira.requestTokenPath,
      jira.host + jira.accessTokenPath,
      jira.consumerKey,
      // @ts-ignore
      jira.consumerSecret.toString('ascii'),
      '1.0',
      'https://miro-kanban-plugin.glitch.me/jira/callback',
      'RSA-SHA1',
    );
  }

  private currentConfig: any;
  initialize(config: any) {
    this.currentConfig = config;
    //this.kanbanSrv.push(config);
  }

  update(card: IJiraCardData) {
    const kanbanCard = this.currentConfig.items.find(
      i => (i.widgetId = card.widgetId),
    );
    if (kanbanCard) {

      const updateUrl = new URL(
        `issue/${kanbanCard.jiraIssueId}/transitions?expand=transitions.fields`,
        this.configSrv.jiraInfo.jiraApiUrl,
      );

      console.log(updateUrl.href);
      let jiraNewStatus = '';
      for (let status in this.currentConfig.metadata["3074457345621789607"].statusIdToKanbanColumnIdMap) {
        const hz = this.currentConfig.metadata["3074457345621789607"].statusIdToKanbanColumnIdMap[status];
        if (hz.columnId == card.columnId) {
          jiraNewStatus = status;
          break;
        }
      }

      const data = {
        update: {
          summary: [{set: card.summary}],
          description: [{set: card.description}],
        },
        transition: {
          id: jiraNewStatus
        }
      }
      //@ts-ignore
      this.oauth._performSecureRequest(
        this.configSrv.jiraInfo.accessToken,
        this.configSrv.jiraInfo.accessTokenSecret,
        'POST',
        updateUrl.href,
        null,
        JSON.stringify(data)
        ,
        'application/json',
        (error, data) => {
          console.log(error, data)
        }
      );
    }
  }

  getCardUpdateInfoForIssue(
    issueId: string,
    toStatus: string,
  ): { boardId: string; widgetId: string; cardJson: any } {
    //const kanbans = (await this.kanbanSrv.getAll()) as Kanban[];
    // kanbans.forEach(kb => {
    //   const kbJson = JSON.parse(kb.json);
    // });
    const statusMap = this.currentConfig.metadata['3074457345621789607']
      .statusIdToKanbanColumnIdMap[toStatus];
    const newColumnId = statusMap.columnId;
    const newSubColumnId = statusMap.subColumnId;
    return {
      boardId: 'o9J_k1IGnzo=',
      widgetId: this.currentConfig.items.find(
        item => item.jiraIssueId == issueId,
      ).widgetId,
      cardJson: {
        kanbanNode: {
          column: newColumnId,
          subColumn: newSubColumnId,
        },
      },
    };
  }
}
