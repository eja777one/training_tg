import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Training } from "./training.entity";

@Entity()
export class Athlete {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", { nullable: false })
  name: string;

  @Column("character varying", { nullable: false })
  sex: string;

  @Column("character varying", { nullable: false })
  age: string;

  @Column("character varying", { nullable: false })
  createdAt: string;

  @Column("character varying", { nullable: true })
  telegramId: string;

  @OneToOne(() => Training,
    (training) => training.athlete)
  training: Training;
};