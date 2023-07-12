import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { TrainingRepository } from "../../inf/training.db.repo";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { Squats } from "../../dom/exercises/squats.entity";

export class GoSquatsCommand {
  constructor(public tgId: string, public tgTime: string,
              public count: number | undefined) {
  };
};

@CommandHandler(GoSquatsCommand)
export class GoSquatsUseCase
  implements ICommandHandler<GoSquatsCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: GoSquatsCommand) {
    const { tgId, tgTime, count } = command;
    const { training, squatsRecord } = await this.checkSquatsRecord(tgId);
    if (!squatsRecord) return;

    if (count) {
      const temp = JSON.parse(squatsRecord.records);
      temp.push(count);
      squatsRecord.records = JSON.stringify(temp);
      await this.trainingRepository.saveSquats(squatsRecord);
    }

    const isTrainingToday = await this
      .checkTrainingDate(tgTime, tgId, squatsRecord);
    if (!isTrainingToday) return;

    const squatsInfo = await this.trainingQueryRepository
      .getSquatsInfo(training.squatsLevel);

    const keys = {};
    keys[squatsInfo.easyRepetitions] = `/goSquats_${squatsInfo.easyRepetitions}`;
    keys[squatsInfo.middleRepetitions] = `/goSquats_${squatsInfo.middleRepetitions}`;
    keys[squatsInfo.hardRepetitions] = `/goSquats_${squatsInfo.hardRepetitions}`;

    const rec = JSON.parse(squatsRecord.records);
    const app = rec.length;

    let rep = "";
    for (let el of rec) rep += el + ", ";

    rep = rep.slice(0, -2);

    if (training.squatsLevel < 6 && app === 3) {
      let message = "Итоги по упражнению\nУровень: " + training.squatsLevel +
        "\nУпражнение: " + squatsInfo.title + "\nПодходы: " + app +
        "\nПовторения: " + rep;

      const arr = rec.filter(el => el === squatsInfo.hardRepetitions);

      if (arr.length === rec.length) {
        training.squatsLevel += 1;
        await this.trainingRepository.saveTraining(training);
        message += "\nПоздравляю, ты перешел на уровень" + training.squatsLevel;
      }

      squatsRecord.isFinished = true;
      await this.trainingRepository.saveSquats(squatsRecord);

      let nextExercise = JSON.parse(training.currentTraining);
      delete nextExercise["squats"];

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

    const message = "Раздел: подъемы ног\nУровень: " + training.squatsLevel +
      "\nУпражнение: " + squatsInfo.title + "\nПодход: " + (app + 1) +
      "\nПовторения: " + rep;

    const keyboard = makeKeyboard(keys);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };

  async checkSquatsRecord(tgId: string) {
    const training = await this.trainingRepository.getTraining(tgId);

    const squatsRecord = await this.trainingRepository
      .getSquatsRecord(training?.id);

    if (!squatsRecord) {
      const message = "Не могу найти запись по приседаниям. Предлагаю" +
        " заново начать тренировку";

      const key = { "Начать тренировку": "/startTraining." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    }
    return { training, squatsRecord };
  }

  async checkTrainingDate(tgTime: string, tgId: string, squatsRecord: Squats) {
    const today = new Date(+tgTime * 1000).toISOString().slice(0, 10);
    const squatsDate = squatsRecord.createdAt.slice(0, 10);

    if (today !== squatsDate) {
      await this.trainingRepository.deleteSquatsRecord(squatsRecord.id);

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