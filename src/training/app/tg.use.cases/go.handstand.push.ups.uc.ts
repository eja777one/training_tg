import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { TrainingRepository } from "../../inf/training.db.repo";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { LegLifts } from "../../dom/exercises/leg.lifts.entity";
import { Squats } from "../../dom/exercises/squats.entity";
import { HandstandPushUps } from "../../dom/exercises/handstand.push.ups.entity";

export class GoHandstandPushUpsCommand {
  constructor(public tgId: string, public tgTime: string,
              public count: number | undefined) {
  };
};

@CommandHandler(GoHandstandPushUpsCommand)
export class GoHandstandPushUpsUseCase
  implements ICommandHandler<GoHandstandPushUpsCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: GoHandstandPushUpsCommand) {
    const { tgId, tgTime, count } = command;
    const { training, handstandPushUpsRecord } = await this
      .checkHandstandPushUpsRecord(tgId);
    if (!handstandPushUpsRecord) return;

    if (count) {
      const temp = JSON.parse(handstandPushUpsRecord.records);
      temp.push(count);
      handstandPushUpsRecord.records = JSON.stringify(temp);
      await this.trainingRepository.saveSquats(handstandPushUpsRecord);
    }

    const isTrainingToday = await this
      .checkTrainingDate(tgTime, tgId, handstandPushUpsRecord);
    if (!isTrainingToday) return;

    const handstandPushUpsInfo = await this.trainingQueryRepository
      .getHandstandPushUpsInfo(training.handstandPushUpsLevel);

    const keys = {};
    keys[handstandPushUpsInfo.easyRepetitions] =
      `/goHandstandPushUps_${handstandPushUpsInfo.easyRepetitions}`;
    keys[handstandPushUpsInfo.middleRepetitions] =
      `/goHandstandPushUps_${handstandPushUpsInfo.middleRepetitions}`;
    keys[handstandPushUpsInfo.hardRepetitions] =
      `/goHandstandPushUps_${handstandPushUpsInfo.hardRepetitions}`;

    const rec = JSON.parse(handstandPushUpsInfo.records);
    const app = rec.length;

    let rep = "";
    for (let el of rec) rep += el + ", ";

    rep = rep.slice(0, -2);

    if (training.handstandPushUpsLevel < 6 && app === 3) {
      let message = "Итоги по упражнению\nУровень: " + training.handstandPushUpsLevel +
        "\nУпражнение: " + handstandPushUpsInfo.title + "\nПодходы: " + app +
        "\nПовторения: " + rep;

      const arr = rec.filter(el => el === handstandPushUpsInfo.hardRepetitions);

      if (arr.length === rec.length) {
        training.handstandPushUpsLevel += 1;
        await this.trainingRepository.saveTraining(training);
        message += "\nПоздравляю, ты перешел на уровень" + training.handstandPushUpsLevel;
      }

      handstandPushUpsRecord.isFinished = true;
      await this.trainingRepository.saveHandstandPushUps(handstandPushUpsRecord);

      let nextExercise = JSON.parse(training.currentTraining);
      delete nextExercise["handstand-push-ups"];

      if (Object.keys(nextExercise).length === 0) {
        training.currentTraining = null;
        message += "\nМолодец спортсмен! Тренировка завершена";

        const date = new Date(training.nextTrainingDate);

        training.lastTraining = training.nextTrainingDate;

        if (date.getDate() === 0) date.setDate(date.getDate() + 4);
        if (date.getDate() === 4) date.setDate(date.getDate() + 3);

        training.nextTrainingDate = date.toISOString();

        await this.trainingRepository.saveTraining(training);

        const key = { "Когда следующая тренировка": "/nextTrainingDate" };
        const keyboard = makeKeyboard(key);

        await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
        return;
      }

      training.currentTraining = JSON.stringify(nextExercise);

      message += "\nЕще " + Object.keys(nextExercise).length + " упражнение";

      const keys = {};

      for (let key of Object.keys(nextExercise)) {
        switch (key) {
          case "push-ups":
            keys["Начать отжимания"] = "/goPushUps";
            break;
          case "leg-lifts":
            keys["Начать подъемы ног"] = "/goLegLifts";
            break;
          case "pull-ups":
            keys["Начать подтягивания"] = "/goPullUps";
            break;
          case "squats":
            keys["Начать приседания"] = "/goSquats";
            break;
          case "handstand-push-ups":
            keys["Начать отжимания в стойке"] = "/goHandstandPushUps";
            break;
          case "bridge":
            keys["Начать мосты"] = "/goBridge";
            break;
        }
      }

      const keyboard = makeKeyboard(keys);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    const message = "Раздел: подъемы ног\nУровень: " + training.handstandPushUpsLevel +
      "\nУпражнение: " + handstandPushUpsInfo.title + "\nПодход: " + (app + 1) +
      "\nПовторения: " + rep;

    const keyboard = makeKeyboard(keys);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };

  async checkHandstandPushUpsRecord(tgId: string) {
    const training = await this.trainingRepository.getTraining(tgId);

    const handstandPushUpsRecord = await this.trainingRepository
      .getHandstandPushUpsRecord(training?.id);

    if (!handstandPushUpsRecord) {
      const message = "Не могу найти запись по отжиманиям в стойке на руках." +
        " Предлагаю заново начать тренировку";

      const key = { "Начать тренировку": "/startTraining" };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    }
    return { training, handstandPushUpsRecord };
  }

  async checkTrainingDate(tgTime: string, tgId: string,
                          handstandPushUpsRecord: HandstandPushUps) {
    const today = new Date(+tgTime * 1000).toISOString().slice(0, 10);
    const handstandPushUpsDate = handstandPushUpsRecord.createdAt.slice(0, 10);

    if (today !== handstandPushUpsDate) {
      await this.trainingRepository
        .deleteHandstandPushUpsRecord(handstandPushUpsRecord.id);

      const message = "Кажется это упражнение не по расписанию." +
        " Предлагаю заново начать тренировку";

      const key = { "Начать тренировку": "/startTraining" };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return false;
    }
    return true;
  }
};