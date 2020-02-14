import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Kanban } from '../entities/kanban.entity';

@Injectable()
export class KanbanService {
  constructor(private readonly entityManager: EntityManager) {}

  private readonly repo = this.entityManager.getRepository(Kanban)

  async push(json: any) {
    return this.repo.save({json: JSON.stringify(json)})
  }

  async getAll() {
    return this.repo.query('select * from kanban');
  }
}
