import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn }
  from "typeorm";
import { Athlete } from "./athlete.entity";
import { PushUps } from "./exercises/push.ups.entity";

@Entity()
export class Training {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid", { nullable: false })
  athleteId: string;

  @OneToOne(() => Athlete,
    (athlete) => athlete.id, { onDelete: "CASCADE" })
  @JoinColumn()
  athlete: Athlete;

  @Column("character varying", { nullable: false })
  startedAt: string;

  @Column("character varying", { nullable: false })
  nextTrainingDate: string;

  @Column("character varying", { nullable: true })
  lastTraining: string;

  @Column("integer", { nullable: true, default: 1 })
  pullUpsLevel: number;

  // @Column("boolean", { nullable: true, default: false })
  // pullUps: boolean;

  @Column("integer", { nullable: true, default: 1 })
  pushUpsLevel: number;

  // @Column("boolean", { nullable: true, default: false })
  // pushUps: boolean;

  @Column("integer", { nullable: true, default: 1 })
  legLiftsLevel: number;

  // @Column("boolean", { nullable: true, default: false })
  // legLifts: boolean;

  @Column("integer", { nullable: true, default: 1 })
  squatsLevel: number;

  // @Column("boolean", { nullable: true, default: false })
  // squats: boolean;

  @Column("integer", { nullable: true, default: 1 })
  bridgeLevel: number;

  @Column("integer", { nullable: true, default: 1 })
  handstandPushUpsLevel: number;

  @Column("integer", { nullable: true, default: 1 })
  currentProgram: number;

  @Column("character varying", { nullable: true })
  currentTraining: string;

  @OneToMany(() => PushUps,
    (pushUps) => pushUps.training)
  pushUps: PushUps[];
};