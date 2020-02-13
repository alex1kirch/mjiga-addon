import { Module } from '@nestjs/common';
import { MiroOauthService } from './services/miro-oauth.service';
import { MiroRestService } from './services/miro-rest.service';

@Module({
  providers: [MiroOauthService, MiroRestService],
  exports: [MiroOauthService, MiroRestService],
})
export class MiroModule {}
