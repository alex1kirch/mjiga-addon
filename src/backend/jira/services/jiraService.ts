import { Injectable } from '@nestjs/common';

export interface IJiraCardData {
  widgetId: string;
  columnId: string;
  subColumnId: string;
  summary: string;
  description: string;
}

export interface IJiraService {

  initialize(config: any)

  update(item: IJiraCardData)
}

@Injectable()
export class JiraServiceFake implements IJiraService{
  initialize(config: any) {
  }

  update(item: IJiraCardData) {
  }

}