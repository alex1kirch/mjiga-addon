import { HttpModule, Module } from '@nestjs/common';
import { RestController } from './controllers/rest.controller';
import { AuthService } from './auth/auth.service';
import { HttpStrategy } from './auth/http.strategy';
import { JiraModule } from '../jira/jira.module';
import { MiroModule } from '../miro/miro.module';
import { KanbanSynchronizersService } from './Services/KanbanSynchronizersService';

@Module({
  imports: [JiraModule, MiroModule, HttpModule],
  providers: [AuthService, HttpStrategy, KanbanSynchronizersService],
  controllers: [RestController],
  exports: [KanbanSynchronizersService]
})
export class RestModule {}
