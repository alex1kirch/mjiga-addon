import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('kanban')
export class Kanban {
  @PrimaryColumn({type: 'numeric', generated: 'increment'})
  id: number;

  @Column({type: 'varchar'})
  json: string;
}
