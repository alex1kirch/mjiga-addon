import { Controller, Post } from '@nestjs/common';

@Controller('/jira/webhook')
export class JiraWebhookController {
  constructor() {}

  @Post()
  async jiraBoardUpdated() {
    return 'Webhook from jira happens!';
  }
}
