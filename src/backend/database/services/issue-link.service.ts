import { Injectable } from '@nestjs/common';
import IssueLinkInfo from '../../../common/dto/IssueLinkInfo';
import { EntityManager } from 'typeorm';
import { IssueLink } from '../entities/issue-link.entity';

@Injectable()
export class IssueLinkService {
  private readonly repo = this.entityManager.getRepository(IssueLink);
  constructor(private readonly entityManager: EntityManager) {}

  async create(links: IssueLinkInfo[]) {
    const linksToSave = await Promise.all(
      links.map(async linkInfo => {
        const { boardKey, widgetId, issueId } = linkInfo;
        return this.repo.create({
          boardId: boardKey,
          widgetId,
          issueId: issueId,
          changedDate: new Date().toISOString(),
        });
      }),
    );

    return await this.repo.save(linksToSave);
  }

  async getLinkByWidget(widgetId: string): Promise<IssueLink[]> {
    return await this.repo.find({ widgetId });
  }
}
