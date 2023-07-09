import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TrainingController } from "./api/trainig-controller";
import { TelegramAdapter } from "../adapters/telegram.adapter";
import { Athlete } from "./dom/athlete.entity";
import { Training } from "./dom/training.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TelegramHandlerUseCase } from "./app/telegram.handler.uc";
import { TrainingRepository } from "./inf/training.db.repo";
import { TrainingQueryRepository } from "./inf/training.q.repo";
import { StartUseCase } from "./app/tg.use.cases/start.uc";
import { AddAthleteInfoUseCase } from "./app/tg.use.cases/add.athlete.info.uc";
import { InputAthleteInfoUseCase } from "./app/tg.use.cases/input.athlete.info.uc";
import { ModAthleteInfoUseCase } from "./app/tg.use.cases/mod.athlete.info.uc";
import { AboutTrainingUseCase } from "./app/tg.use.cases/about.teaining.uc";
import { AboutExercisesUseCase } from "./app/tg.use.cases/about.exercises.us";
import { StartProgramUseCase } from "./app/tg.use.cases/start.program.uc";
import { InputStartDateUseCase } from "./app/tg.use.cases/input.start.date";
import { NextTrainingDateUseCase } from "./app/tg.use.cases/next.training.date.uc";
import { TrainingTable } from "./dom/training.table.entity";
import { StartTrainingUseCase } from "./app/tg.use.cases/start.trainig.uc";
import { PushUps } from "./dom/exercises/push.ups.entity";
import { LegLifts } from "./dom/exercises/leg.lifts.entity";
import { PassTrainingUseCase } from "./app/tg.use.cases/pass.training.uc";
import { GoPushUpsUseCase } from "./app/tg.use.cases/go.push.ups.uc";
import { PushUpsTable } from "./dom/exercises.tables/push.ups.table.entity";
import { UnknownUseCase } from "./app/tg.use.cases/unknown.uc";
import { PullUps } from "./dom/exercises/pull.ups.entity";
import { Squats } from "./dom/exercises/squats.entity";
import { HandstandPushUps } from "./dom/exercises/handstand.push.ups.entity";
import { Bridge } from "./dom/exercises/bridge.etity";
import { GoLegLiftsUseCase } from "./app/tg.use.cases/go.leg.lifts.uc";
import { LegLiftsTable } from "./dom/exercises.tables/leg.lifts.table.entity";
import { GoPullUpsUseCase } from "./app/tg.use.cases/go.pull.ups.uc";
import { PullUpsTable } from "./dom/exercises.tables/pull.ups.table.entity";
import { BridgeTable } from "./dom/exercises.tables/bridge.table.entity";
import { SquatsTable } from "./dom/exercises.tables/squats.table.entity";
import { HandstandPushUpsTable } from "./dom/exercises.tables/handstand.push.ups.table.entity";
import { GoSquatsUseCase } from "./app/tg.use.cases/go.squats.uc";
import { GoHandstandPushUpsUseCase } from "./app/tg.use.cases/go.handstand.push.ups.uc";
import { GoBridgeUseCase } from "./app/tg.use.cases/go.bridge.uc";

const trainingUseCases = [
  TelegramHandlerUseCase,
  StartUseCase,
  AddAthleteInfoUseCase,
  InputAthleteInfoUseCase,
  ModAthleteInfoUseCase,
  AboutTrainingUseCase,
  AboutExercisesUseCase,
  StartProgramUseCase,
  InputStartDateUseCase,
  NextTrainingDateUseCase,
  StartTrainingUseCase,
  PassTrainingUseCase,
  GoPushUpsUseCase,
  GoLegLiftsUseCase,
  GoPullUpsUseCase,
  GoSquatsUseCase,
  GoHandstandPushUpsUseCase,
  GoBridgeUseCase,
  UnknownUseCase
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      Athlete,
      Training,
      TrainingTable,
      PushUps,
      LegLifts,
      PushUpsTable,
      LegLiftsTable,
      PullUpsTable,
      BridgeTable,
      SquatsTable,
      HandstandPushUpsTable,
      PullUps,
      Squats,
      HandstandPushUps,
      Bridge
    ])
  ],
  controllers: [TrainingController],
  providers: [
    TelegramAdapter,
    TrainingRepository,
    TrainingQueryRepository,
    ...trainingUseCases
  ]
})
export class TrainingModule {
}
