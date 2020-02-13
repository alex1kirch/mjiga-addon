import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('issue_links')
export class IssueLink {
  @PrimaryColumn()
  boardId: string;

  @PrimaryColumn('bigint')
  widgetId: string;

  @Column({ nullable: false })
  issueId: string;

  @Column({ type: 'varchar', nullable: true })
  changedDate?: string;
}
