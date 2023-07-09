import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TrainingTable {
  @PrimaryGeneratedColumn("increment")
  level: number;

  @Column("character varying", { nullable: false })
  title: string;

  @Column("integer", { nullable: false })
  daysCount: number;

  @Column("character varying", { nullable: true })
  monday: string;

  @Column("character varying", { nullable: true })
  tuesday: string;

  @Column("character varying", { nullable: true })
  wednesday: string;

  @Column("character varying", { nullable: true })
  thursday: string;

  @Column("character varying", { nullable: true })
  friday: string;

  @Column("character varying", { nullable: true })
  saturday: string;

  @Column("character varying", { nullable: true })
  sunday: string;
};

// STOP HERE - GENERATE TABLE AND FILL WITH VALUES