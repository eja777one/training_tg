import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HandstandPushUpsTable {
  @PrimaryGeneratedColumn("increment")
  level: number;

  @Column("character varying", { nullable: false })
  title: string;

  @Column("character varying", { nullable: false })
  description: string;

  @Column("integer", { nullable: false })
  easyApproaches: number;

  @Column("integer", { nullable: false })
  easyRepetitions: number;

  @Column("integer", { nullable: false })
  middleApproaches: number;

  @Column("integer", { nullable: false })
  middleRepetitions: number;

  @Column("integer", { nullable: false })
  hardApproaches: number;

  @Column("integer", { nullable: false })
  hardRepetitions: number;
};