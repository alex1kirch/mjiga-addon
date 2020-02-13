import { NestFactory } from '@nestjs/core';
import { AddonModule } from './addon/addon.module';
import { ConfigService } from './config/services/config.service';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AddonModule);
  const config = app.get(ConfigService);
  app
    .setGlobalPrefix(config.localBaseUrl.pathname.slice(1))
    .useStaticAssets(path.resolve(process.cwd(), 'dist/public'), {
      setHeaders: (res: Response, path) => {
        if (path.includes('/public/assets/')) {
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
      },
    })
    .use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
      next();
    });
  app.enableCors();
  await app.listen(config.port);
}
bootstrap();
