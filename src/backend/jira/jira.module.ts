import { Module } from '@nestjs/common';
import { JiraWebhookController } from './controllers/jira-webhook.controller';

@Module({
  providers: [],
  controllers: [JiraWebhookController],
  exports: [],
})
export class JiraModule {}
