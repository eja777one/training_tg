import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { errorHandler } from "../../application/error.handler";
import { Athlete } from "../dom/athlete.entity";
import { Training } from "../dom/training.entity";
import { PushUps } from "../dom/exercises/push.ups.entity";
import { LegLifts } from "../dom/exercises/leg.lifts.entity";
import { PullUps } from "../dom/exercises/pull.ups.entity";
import { Squats } from "../dom/exercises/squats.entity";
import { HandstandPushUps } from "../dom/exercises/handstand.push.ups.entity";
import { Bridge } from "../dom/exercises/bridge.etity";

@Injectable()
export class TrainingRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Athlete) private athleteRepo: Repository<Athlete>,
    @InjectRepository(Training) private trainingRepo: Repository<Training>,
    @InjectRepository(PushUps) private pushUpsRepo: Repository<PushUps>,
    @InjectRepository(LegLifts) private legLiftsRepo: Repository<LegLifts>,
    @InjectRepository(PullUps) private pullUpsRepo: Repository<PullUps>,
    @InjectRepository(Squats) private squatsRepo: Repository<Squats>,
    @InjectRepository(Bridge) private bridgeRepo: Repository<Bridge>,
    @InjectRepository(HandstandPushUps) private handstandPushUpsRepo:
      Repository<HandstandPushUps>
  ) {
  };

  async deletePushUpsRecord(id: number) {
    try {
      await this.pushUpsRepo.delete({ id });
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async deleteHandstandPushUpsRecord(id: number) {
    try {
      await this.handstandPushUpsRepo.delete({ id });
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async deletePullUpsRecord(id: number) {
    try {
      await this.pullUpsRepo.delete({ id });
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async deleteSquatsRecord(id: number) {
    try {
      await this.squatsRepo.delete({ id });
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async deleteLegLiftsRecord(id: number) {
    try {
      await this.legLiftsRepo.delete({ id });
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  }

  async deleteBridgeRecord(id: number) {
    try {
      await this.bridgeRepo.delete({ id });
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  }

  async getBridgeRecord(trainingId: string) {
    try {
      const bridgeRecord = await this.bridgeRepo
        .findOneBy({ trainingId, isFinished: false });
      return bridgeRecord;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getSquatsRecord(trainingId: string) {
    try {
      const squatsRecord = await this.squatsRepo
        .findOneBy({ trainingId, isFinished: false });
      return squatsRecord;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getHandstandPushUpsRecord(trainingId: string) {
    try {
      const handstandPushUpsRecord = await this.handstandPushUpsRepo
        .findOneBy({ trainingId, isFinished: false });
      return handstandPushUpsRecord;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getPullUpsRecord(trainingId: string) {
    try {
      const pullUpsRecord = await this.pullUpsRepo
        .findOneBy({ trainingId, isFinished: false });
      return pullUpsRecord;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getPushUpsRecord(trainingId: string) {
    try {
      const pushUpsRecord = await this.pushUpsRepo
        .findOneBy({ trainingId, isFinished: false });
      return pushUpsRecord;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getLegLiftsRecord(trainingId: string) {
    try {
      const legLiftsRecord = await this.legLiftsRepo
        .findOneBy({ trainingId, isFinished: false });
      return legLiftsRecord;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async saveBridge(bridge: Bridge) {
    try {
      await this.bridgeRepo.save(bridge);
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async saveHandstandPushUps(handstandPushUps: HandstandPushUps) {
    try {
      await this.handstandPushUpsRepo.save(handstandPushUps);
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async saveSquats(squats: Squats) {
    try {
      await this.squatsRepo.save(squats);
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async savePullUps(pullUps: PullUps) {
    try {
      await this.pullUpsRepo.save(pullUps);
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async savePushUps(pushUps: PushUps) {
    try {
      await this.pushUpsRepo.save(pushUps);
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async saveLegLifts(legLifts: LegLifts) {
    try {
      await this.legLiftsRepo.save(legLifts);
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async getTraining(telegramId: string) {
    try {
      const athlete = await this.getAthlete(telegramId);
      if (!athlete) return null;
      const training = await this.trainingRepo
        .findOneBy({ athleteId: athlete.id });
      return training;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async saveTraining(training: Training) {
    try {
      await this.trainingRepo.save(training);
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  }

  async getAthlete(telegramId: string) {
    try {
      const athlete = await this.athleteRepo.findOneBy({ telegramId });
      return athlete;
    } catch (e) {
      return errorHandler(e);
    }
  };

  async saveAthlete(athlete: Athlete) {
    try {
      await this.athleteRepo.save(athlete);
      return true;
    } catch (e) {
      return errorHandler(e);
    }
  };

};