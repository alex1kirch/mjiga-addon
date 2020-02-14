import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '../../config/services/config.service';
import { IssueLink } from '../entities/issue-link.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Kanban } from '../entities/kanban.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.config.dbConnection,
      entities: [IssueLink, Kanban],
      logging: true,
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
