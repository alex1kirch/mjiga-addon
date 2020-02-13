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

export class JiraServiceFake implements IJiraService{
  initialize(config: any) {
  }

  update(item: IJiraCardData) {
  }

}