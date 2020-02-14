import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('kanban')
export class Kanban {
  @PrimaryColumn()
  id: number;

  @Column({type: 'varchar'})
  json: string;
}
