import { Injectable } from '@nestjs/common';
import { URL } from 'url';
import * as configJson from '../../../../config.json';
import { ConnectionOptions } from 'typeorm';
import IMiroAppInfo from '../interfaces/IMiroAppInfo';

/**
 * Class for access to app config according to runtime environment
 */
@Injectable()
export class ConfigService {
  private readonly parsedConfig;
  constructor() {
    let confStr = JSON.stringify(configJson);
    const envVars = confStr.match(/\$\w+/g);

    if (envVars && envVars.length) {
      envVars.forEach(v => {
        confStr = confStr.replace(v, process.env[v.slice(1)] || v);
      });
    }

    this.parsedConfig = JSON.parse(confStr);
  }

  readonly env = process.env.NODE_ENV || 'development';

  get localBaseUrl(): URL {
    return new URL(this.parsedConfig[this.env].localBaseUrl);
  }

  get port(): number {
    return this.parsedConfig[this.env].port;
  }

  get dbConnection(): ConnectionOptions {
    return JSON.parse(JSON.stringify(this.parsedConfig[this.env].dbConnection));
  }

  get jwtSecret() {
    return 'jwtSecret';
  }

  get miroAppInfo(): IMiroAppInfo {
    return this.parsedConfig[this.env].miro;
  }

  getField<T = any>(fieldName): T | null {
    const field = this.parsedConfig[this.env][fieldName];
    return JSON.parse(
      JSON.stringify(typeof field === 'undefined' ? null : field),
    );
  }
}
