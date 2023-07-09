import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Training } from "../training.entity";

@Entity()
export class LegLifts {
  constructor(date: string, trainingId: string) {
    this.createdAt = date;
    this.trainingId = trainingId;
  }

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("character varying", { nullable: false })
  trainingId: string;

  @ManyToOne(() => Training,
    (training) => training.id,
    { onDelete: "CASCADE" })
  training: Training;

  @Column("character varying", { nullable: false, default: "[]" })
  records: string;

  @Column("character varying", { nullable: false })
  createdAt: string;

  @Column("boolean", { nullable: false, default: false })
  isFinished: boolean;
};