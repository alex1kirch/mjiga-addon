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

  private kanbans: any[] = [];
  initialize(config: any) {
    this.kanbans.push(config);
    //this.kanbanSrv.push(config);
  }

  update(card: IJiraCardData) {
    let kanbanCard = null;
    let kanban = null;
    this.kanbans.forEach(kb => {
      if (!kanbanCard) {
        kanbanCard = kb.items.find(i => i.widgetId === card.widgetId)
        kanban = kb;
      }
    });
    if (kanbanCard) {

      const transitionUrl = new URL(
        `issue/${kanbanCard.jiraIssueId}/transitions?expand=transitions.fields`,
        this.configSrv.jiraInfo.jiraApiUrl,
      );

      const updateUrl = new URL(`issue/${kanbanCard.jiraIssueId}/`, this.configSrv.jiraInfo.jiraApiUrl);

      console.log(transitionUrl.href);
      console.log(updateUrl.href);
      let jiraTransition = '';
      for (let status in kanban.metadata["3074457345621789607"].statusIdToKanbanColumnIdMap) {
        const hz = kanban.metadata["3074457345621789607"].statusIdToKanbanColumnIdMap[status];
        if (hz.columnId == card.columnId) {
          jiraTransition = hz.transitionId;
          break;
        }
      }

      const transitionData = {
        transition: {
          id: jiraTransition
        }
      };
      const updateData = {
        update: {
            summary: [{set: card.summary}],
            description: [{set: {
                "type": "doc",
                "version": 1,
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "text": card.description,
                        "type": "text"
                      }
                    ]
                  }
                ]
              }}],
          }
      };

      //@ts-ignore
      this.oauth._performSecureRequest(
        this.configSrv.jiraInfo.accessToken,
        this.configSrv.jiraInfo.accessTokenSecret,
        'POST',
        transitionUrl.href,
        null,
        JSON.stringify(transitionData),
        'application/json',
        (error, data) => {
          console.log(error, data)
        }
      );
      //@ts-ignore
      this.oauth._performSecureRequest(
        this.configSrv.jiraInfo.accessToken,
        this.configSrv.jiraInfo.accessTokenSecret,
        'PUT',
        updateUrl.href,
        null,
        JSON.stringify(updateData),
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
  ): { boardId: string; widgetId: string; cardJson: any }[] {
    const result = [];
    this.kanbans.forEach(kb => {
      const statusMap = kb.metadata['3074457345621789607']
        .statusIdToKanbanColumnIdMap[toStatus];
      const newColumnId = statusMap.columnId;
      const newSubColumnId = statusMap.subColumnId;

      result.push({
        boardId: 'o9J_k1IGnzo=',
        widgetId: kb.items.find(
          item => item.jiraIssueId == issueId,
        ).widgetId,
        cardJson: {
          kanbanNode: {
            column: newColumnId,
            subColumn: newSubColumnId,
          },
        },
      })
    });

    return result;
  }
}
