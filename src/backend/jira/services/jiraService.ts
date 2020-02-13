import { Injectable } from '@nestjs/common';

export interface IJiraCardData {
  id: string,
  title: string,
  status: string,
  description: string,
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