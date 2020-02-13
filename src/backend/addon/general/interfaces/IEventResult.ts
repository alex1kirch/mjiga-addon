import { IEvent } from './IEvent';
import { Response } from 'node-fetch';

export default interface IEventResult<T extends IEvent = IEvent> {
  event: T;
  response: Response;
}
