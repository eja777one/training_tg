import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { errorHandler } from "../../application/error.handler";
import { Athlete } from "../dom/athlete.entity";
import { Training } from "../dom/training.entity";
import { TrainingTable } from "../dom/training.table.entity";
import { days } from "../training.types";
import { PushUpsTable } from "../dom/exercises.tables/push.ups.table.entity";
import { LegLiftsTable } from "../dom/exercises.tables/leg.lifts.table.entity";
import { PullUpsTable } from "../dom/exercises.tables/pull.ups.table.entity";
import { SquatsTable } from "../dom/exercises.tables/squats.table.entity";
import { HandstandPushUps } from "../dom/exercises/handstand.push.ups.entity";
import { Bridge } from "../dom/exercises/bridge.etity";

@Injectable()
export class TrainingQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  };

  async getBridgeInfo(level: number) {
    try {
      const bridgeInfo = await this.dataSource
        .getRepository(Bridge)
        .createQueryBuilder("t")
        .where("t.level = :level", { level })
        .getOne();

      return bridgeInfo;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getHandstandPushUpsInfo(level: number) {
    try {
      const handstandPushUpsInfo = await this.dataSource
        .getRepository(HandstandPushUps)
        .createQueryBuilder("t")
        .where("t.level = :level", { level })
        .getOne();

      return handstandPushUpsInfo;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getPullUpsInfo(level: number) {
    try {
      const pullUpsInfo = await this.dataSource
        .getRepository(PullUpsTable)
        .createQueryBuilder("t")
        .where("t.level = :level", { level })
        .getOne();

      return pullUpsInfo;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getSquatsInfo(level: number) {
    try {
      const squatsInfo = await this.dataSource
        .getRepository(SquatsTable)
        .createQueryBuilder("t")
        .where("t.level = :level", { level })
        .getOne();

      return squatsInfo;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getPushUpsInfo(level: number) {
    try {
      const pushUpsInfo = await this.dataSource
        .getRepository(PushUpsTable)
        .createQueryBuilder("t")
        .where("t.level = :level", { level })
        .getOne();

      return pushUpsInfo;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getLegLiftsInfo(level: number) {
    try {
      const pushUpsInfo = await this.dataSource
        .getRepository(LegLiftsTable)
        .createQueryBuilder("t")
        .where("t.level = :level", { level })
        .getOne();

      return pushUpsInfo;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getTrainingInfo(currentProgram: number, dayName: number) {
    try {
      let trainingInfo: any = await this.dataSource
        .getRepository(TrainingTable)
        .createQueryBuilder("tt")
        .where("tt.level = :currentProgram", { currentProgram })
        .getOne();

      console.log(trainingInfo);
      console.log(days[0]);

      trainingInfo = trainingInfo[days[0]];

      return trainingInfo;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getAthletesForNotification() {
    try {
      let nextTrainingDate: any = new Date();

      console.log(nextTrainingDate);
      nextTrainingDate.setHours(3);
      nextTrainingDate.setMinutes(0);
      nextTrainingDate.setSeconds(0);
      nextTrainingDate.setMilliseconds(0);
      console.log(nextTrainingDate);

      nextTrainingDate = nextTrainingDate.toISOString();

      const trainings = await this.dataSource
        .getRepository(Training)
        .createQueryBuilder("t")
        .innerJoinAndSelect("t.athlete", "a")
        .where("t.nextTrainingDate = :nextTrainingDate", { nextTrainingDate })
        .getMany();

      // console.log(trainings);
      return trainings.map(tr => tr.athlete.telegramId);
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getTraining(telegramId: string) {
    try {
      const training = await this.dataSource
        .getRepository(Training)
        .createQueryBuilder("t")
        .innerJoinAndSelect("t.athlete", "a")
        .where("a.telegramId = :telegramId", { telegramId })
        .getOne();
      return training;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getAthlete(telegramId: string) {
    try {
      const athlete = await this.dataSource
        .getRepository(Athlete)
        .createQueryBuilder("a")
        .where("a.telegramId = :telegramId", { telegramId })
        .getOne();

      return athlete;
    } catch (e) {
      return errorHandler(e);
    }
  };
};

const formatChatIds = (trainings: any) => {
  const chatIds = trainings.map(tr => tr.athlete.telegramId);
  return chatIds;
};