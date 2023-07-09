import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { TrainingRepository } from "../../inf/training.db.repo";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { PushUps } from "../../dom/exercises/push.ups.entity";

export class GoPushUpsCommand {
  constructor(public tgId: string, public tgTime: string,
              public count: number | undefined) {
  };
};

@CommandHandler(GoPushUpsCommand)
export class GoPushUpsUseCase
  implements ICommandHandler<GoPushUpsCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: GoPushUpsCommand) {
    const { tgId, tgTime, count } = command;
    const { training, pushUpsRecord } = await this.checkPushUpsRecord(tgId);
    if (!pushUpsRecord) return;

    if (count) {
      const temp = JSON.parse(pushUpsRecord.records);
      temp.push(count);
      pushUpsRecord.records = JSON.stringify(temp);
      await this.trainingRepository.savePushUps(pushUpsRecord);
    }

    const isTrainingToday = await this
      .checkTrainingDate(tgTime, tgId, pushUpsRecord);
    if (!isTrainingToday) return;

    const pushUpsInfo = await this.trainingQueryRepository
      .getPushUpsInfo(training.pushUpsLevel);

    const keys = {};
    keys[pushUpsInfo.easyRepetitions] = `/goPushUps_${pushUpsInfo.easyRepetitions}`;
    keys[pushUpsInfo.middleRepetitions] = `/goPushUps_${pushUpsInfo.middleRepetitions}`;
    keys[pushUpsInfo.hardRepetitions] = `/goPushUps_${pushUpsInfo.hardRepetitions}`;

    const rec = JSON.parse(pushUpsRecord.records);
    const app = rec.length;

    let rep = "";
    for (let el of rec) rep += el + ", ";

    rep = rep.slice(0, -2);

    if (training.pushUpsLevel < 6 && app === 3) {
      let message = "Итоги по упражнению\nУровень: " + training.pushUpsLevel +
        "\nУпражнение: " + pushUpsInfo.title + "\nПодходы: " + app +
        "\nПовторения: " + rep;

      const arr = rec.filter(el => el === pushUpsInfo.hardRepetitions);

      if (arr.length === rec.length) {
        training.pushUpsLevel += 1;
        await this.trainingRepository.saveTraining(training);
        message += "\nПоздравляю, ты перешел на уровень" + training.pushUpsLevel;
      }

      pushUpsRecord.isFinished = true;
      await this.trainingRepository.savePushUps(pushUpsRecord);

      let nextExercise = JSON.parse(training.currentTraining);
      delete nextExercise["push-ups"];

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

    const message = "Раздел: отжимания\nУровень: " + training.pushUpsLevel +
      "\nУпражнение: " + pushUpsInfo.title + "\nПодход: " + (app + 1) +
      "\nПовторения: " + rep;

    const keyboard = makeKeyboard(keys);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };

  async checkPushUpsRecord(tgId: string) {
    const training = await this.trainingRepository.getTraining(tgId);

    const pushUpsRecord = await this.trainingRepository
      .getPushUpsRecord(training?.id);

    if (!pushUpsRecord) {
      const message = "Не могу найти запись по отжиманиям. Предлагаю" +
        " заново начать тренировку";

      const key = { "Начать тренировку": "/startTraining" };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    }
    return { training, pushUpsRecord };
  }

  async checkTrainingDate(tgTime: string, tgId: string, pushUpsRecord: PushUps) {
    const today = new Date(+tgTime * 1000).toISOString().slice(0, 10);
    const pushUpsDate = pushUpsRecord.createdAt.slice(0, 10);

    if (today !== pushUpsDate) {
      await this.trainingRepository.deletePushUpsRecord(pushUpsRecord.id);

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