import { Module } from '@nestjs/common';
import { JiraWebhookController } from './controllers/jira-webhook.controller';
import { MiroModule } from '../miro/miro.module';
import { JiraService } from './services/jiraService';

@Module({
  providers: [JiraService],
  controllers: [JiraWebhookController],
  imports: [MiroModule],
  exports: [JiraService],
})
export class JiraModule {}
