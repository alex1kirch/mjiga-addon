import { Global, Module } from '@nestjs/common';
import { TypeOrmConfigService } from './services/typeormconfig.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JiraModule } from '../jira/jira.module';
import { IssueLinkService } from './services/issue-link.service';
import { KanbanService } from './services/kanban.service';

const providers = [TypeOrmConfigService, IssueLinkService, KanbanService];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    JiraModule,
  ],
  providers,
  exports: providers.slice(),
})
export class DatabaseModule {}
