import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import IssueLinkInfo from '../../../common/dto/IssueLinkInfo';
import { IssueLinkService } from '../../database/services/issue-link.service';
import IssueLinksCreationInfo from '../../../common/dto/IssueLinksCreationInfo';
import { Request } from 'express';

@Controller('api/v1')
@UseGuards(AuthGuard('bearer'))
export class RestController {
  constructor(private readonly issueLinkSrv: IssueLinkService) {}

  @Post('links')
  async createLinks(
    @Req() req: Request,
    @Body() linksInfo: IssueLinkInfo[],
  ): Promise<IssueLinksCreationInfo> {
    const issueLinks = await this.issueLinkSrv.create(linksInfo);
    return { count: issueLinks.length };
  }
}
