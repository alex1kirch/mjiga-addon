import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MiroModule } from '../miro/miro.module';
import { JiraModule } from '../jira/jira.module';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '../config/config.module';
import { AddonController } from './controllers/addon.controller';
import { MiroOauthMiddleware } from '../miro/middlewares/miro-oauth.middleware';
import { RestModule } from '../rest/rest.module';
import { AddonEventsService } from './services/addon-events.service';

@Global()
@Module({
  imports: [ConfigModule, DatabaseModule, MiroModule, JiraModule, RestModule],
  controllers: [AddonController],
  providers: [AddonEventsService],
  exports: [AddonEventsService],
})
export class AddonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MiroOauthMiddleware)
      .forRoutes({ path: 'install', method: RequestMethod.GET });
  }
}
