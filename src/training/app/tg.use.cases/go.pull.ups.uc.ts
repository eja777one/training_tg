import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { TrainingRepository } from "../../inf/training.db.repo";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { PullUps } from "../../dom/exercises/pull.ups.entity";

export class GoPullUpsCommand {
  constructor(public tgId: string, public tgTime: string,
              public count: number | undefined) {
  };
};

@CommandHandler(GoPullUpsCommand)
export class GoPullUpsUseCase
  implements ICommandHandler<GoPullUpsCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: GoPullUpsCommand) {
    const { tgId, tgTime, count } = command;
    const { training, pullUpsRecord } = await this.checkPullUpsRecord(tgId);
    if (!pullUpsRecord) return;

    if (count) {
      const temp = JSON.parse(pullUpsRecord.records);
      temp.push(count);
      pullUpsRecord.records = JSON.stringify(temp);
      await this.trainingRepository.savePullUps(pullUpsRecord);
    }

    const isTrainingToday = await this
      .checkTrainingDate(tgTime, tgId, pullUpsRecord);
    if (!isTrainingToday) return;

    const pullUpsInfo = await this.trainingQueryRepository
      .getPullUpsInfo(training.pullUpsLevel);

    const keys = {};
    keys[pullUpsInfo.easyRepetitions] = `/goPullUps_${pullUpsInfo.easyRepetitions}`;
    keys[pullUpsInfo.middleRepetitions] = `/goPullUps_${pullUpsInfo.middleRepetitions}`;
    keys[pullUpsInfo.hardRepetitions] = `/goPullUps_${pullUpsInfo.hardRepetitions}`;

    const rec = JSON.parse(pullUpsRecord.records);
    const app = rec.length;

    let rep = "";
    for (let el of rec) rep += el + ", ";

    rep = rep.slice(0, -2);

    if (training.pullUpsLevel < 6 && app === 3) {
      let message = "Итоги по упражнению\nУровень: " + training.pullUpsLevel +
        "\nУпражнение: " + pullUpsInfo.title + "\nПодходы: " + app +
        "\nПовторения: " + rep;

      const arr = rec.filter(el => el === pullUpsInfo.hardRepetitions);

      if (arr.length === rec.length) {
        training.pullUpsLevel += 1;
        await this.trainingRepository.saveTraining(training);
        message += "\nПоздравляю, ты перешел на уровень" + training.pullUpsLevel;
      }

      pullUpsRecord.isFinished = true;
      await this.trainingRepository.savePullUps(pullUpsRecord);

      let nextExercise = JSON.parse(training.currentTraining);
      delete nextExercise["pull-ups"];

      if (Object.keys(nextExercise).length === 0) {
        training.currentTraining = null;
        message += "\nМолодец спортсмен! Тренировка завершена";

        const date = new Date(training.nextTrainingDate);

        training.lastTraining = training.nextTrainingDate;

        if (date.getDate() === 0) date.setDate(date.getDate() + 4);
        if (date.getDate() === 4) date.setDate(date.getDate() + 3);

        training.nextTrainingDate = date.toISOString();

        await this.trainingRepository.saveTraining(training);

        const key = { "Когда следующая тренировка": "/nextTrainingDate." };
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
            keys["Начать отжимания"] = "/goPushUps.";
            break;
          case "leg-lifts":
            keys["Начать подъемы ног"] = "/goLegLifts.";
            break;
          case "pull-ups":
            keys["Начать подтягивания"] = "/goPullUps.";
            break;
          case "squats":
            keys["Начать приседания"] = "/goSquats.";
            break;
          case "handstand-push-ups":
            keys["Начать отжимания в стойке"] = "/goHandstandPushUps.";
            break;
          case "bridge":
            keys["Начать мосты"] = "/goBridge.";
            break;
        }
      }

      const keyboard = makeKeyboard(keys);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    const message = "Раздел: подъемы ног\nУровень: " + training.pullUpsLevel +
      "\nУпражнение: " + pullUpsInfo.title + "\nПодход: " + (app + 1) +
      "\nПовторения: " + rep;

    const keyboard = makeKeyboard(keys);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };

  async checkPullUpsRecord(tgId: string) {
    const training = await this.trainingRepository.getTraining(tgId);

    const pullUpsRecord = await this.trainingRepository
      .getPullUpsRecord(training?.id);

    if (!pullUpsRecord) {
      const message = "Не могу найти запись по подтягиваниям. Предлагаю" +
        " заново начать тренировку";

      const key = { "Начать тренировку": "/startTraining." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    }
    return { training, pullUpsRecord };
  }

  async checkTrainingDate(tgTime: string, tgId: string,
                          pullUpsRecord: PullUps) {
    const today = new Date(+tgTime * 1000).toISOString().slice(0, 10);
    const pullUpsDate = pullUpsRecord.createdAt.slice(0, 10);

    if (today !== pullUpsDate) {
      await this.trainingRepository.deletePullUpsRecord(pullUpsRecord.id);

      const message = "Кажется это упражнение не по расписанию." +
        " Предлагаю заново начать тренировку";

      const key = { "Начать тренировку": "/startTraining." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return false;
    }
    return true;
  }
};