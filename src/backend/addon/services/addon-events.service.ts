import { Injectable } from '@nestjs/common';
import { IEvent, IIssueUpdatedEvent } from '../general/interfaces/IEvent';
import { Subject } from 'rxjs';
import { bufferTime, filter } from 'rxjs/operators';
import { EventType } from '../general/enums/EventType';
import { MiroRestService } from '../../miro/services/miro-rest.service';
import IEventResult from '../general/interfaces/IEventResult';

@Injectable()
export class AddonEventsService {
  private readonly eventSubject = new Subject<IEvent>();
  private readonly eventHandleResult = new Subject<IEventResult>();
  private readonly issuesUpdate$ = this.eventSubject.pipe(
    filter<IIssueUpdatedEvent>(
      e => e.type === EventType.ISSUE_TRACKER_ISSUE_UPDATED,
    ),
    bufferTime(5000, null, 10),
  );
  private readonly issueUpdateError$ = this.eventHandleResult.pipe(
    filter(
      r =>
        r.event.type === EventType.ISSUE_TRACKER_ISSUE_UPDATED &&
        !r.response.ok,
    ),
  );

  constructor(private readonly miroRestSrv: MiroRestService) {
    this.issuesUpdate$.subscribe(this.issueUpdateHandler);
    this.issueUpdateError$.subscribe(this.issueUpdateErrorHandler);
  }

  private issueUpdateHandler = (events: IIssueUpdatedEvent[]) => {
    events.forEach(event => {
      this.miroRestSrv
        .updateCard(
          'someaccessToken',
          event.issueLink.boardId,
          event.issueLink.widgetId,
          event.issueInfo,
        )
        .then(response => this.eventHandleResult.next({ event, response }));
    });
  };

  private issueUpdateErrorHandler = async (
    result: IEventResult<IIssueUpdatedEvent>,
  ) => {};

  pushEvent(e: IEvent): void {
    this.eventSubject.next(e);
  }
}
