import { Entity, Column } from 'typeorm';

@Entity()
export class TokenPostgresEntity {
  @Column()
  toke: string;
  @Column()
  deletedAt: Date | null;
}
