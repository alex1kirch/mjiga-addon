import { Module } from '@nestjs/common';
import { JiraWebhookController } from './controllers/jira-webhook.controller';
import { MiroModule } from '../miro/miro.module';

@Module({
  providers: [],
  controllers: [JiraWebhookController],
  imports: [MiroModule],
  exports: [],
})
export class JiraModule {}
