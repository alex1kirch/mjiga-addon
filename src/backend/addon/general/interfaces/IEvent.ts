import { EventType } from '../enums/EventType';
import { IssueLink } from '../../../database/entities/issue-link.entity';
import IssueInfo from '../../../../common/dto/IssueInfo';

export interface IEvent {
  type: EventType;
}

export interface IIssueUpdatedEvent extends IEvent {
  type: EventType.ISSUE_TRACKER_ISSUE_UPDATED;
  issueLink: IssueLink;
  issueInfo: IssueInfo;
}

export interface IMetaChangedEvent extends IEvent {
  type: EventType.ISSUE_TRACKER_META_CHANGED;
}
