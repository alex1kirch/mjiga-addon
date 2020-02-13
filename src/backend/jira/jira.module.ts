import { Module } from '@nestjs/common';
import { JiraWebhookController } from './controllers/jira-webhook.controller';
import { MiroModule } from '../miro/miro.module';
import { JiraServiceFake } from './services/jiraService';

@Module({
  providers: [JiraServiceFake],
  controllers: [JiraWebhookController],
  imports: [MiroModule],
  exports: [JiraServiceFake],
})
export class JiraModule {}
