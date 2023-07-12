import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { TrainingRepository } from "../../inf/training.db.repo";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { LegLifts } from "../../dom/exercises/leg.lifts.entity";

export class GoLegLiftsCommand {
  constructor(public tgId: string, public tgTime: string,
              public count: number | undefined) {
  };
};

@CommandHandler(GoLegLiftsCommand)
export class GoLegLiftsUseCase
  implements ICommandHandler<GoLegLiftsCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: GoLegLiftsCommand) {
    const { tgId, tgTime, count } = command;
    const { training, legLiftsRecord } = await this.checkLegLiftsRecord(tgId);
    if (!legLiftsRecord) return;

    if (count) {
      const temp = JSON.parse(legLiftsRecord.records);
      temp.push(count);
      legLiftsRecord.records = JSON.stringify(temp);
      await this.trainingRepository.saveLegLifts(legLiftsRecord);
    }

    const isTrainingToday = await this
      .checkTrainingDate(tgTime, tgId, legLiftsRecord);
    if (!isTrainingToday) return;

    const legLiftsInfo = await this.trainingQueryRepository
      .getLegLiftsInfo(training.pushUpsLevel);

    const keys = {};
    keys[legLiftsInfo.easyRepetitions] = `/goLegLifts_${legLiftsInfo.easyRepetitions}`;
    keys[legLiftsInfo.middleRepetitions] = `/goLegLifts_${legLiftsInfo.middleRepetitions}`;
    keys[legLiftsInfo.hardRepetitions] = `/goLegLifts_${legLiftsInfo.hardRepetitions}`;

    const rec = JSON.parse(legLiftsRecord.records);
    const app = rec.length;

    let rep = "";
    for (let el of rec) rep += el + ", ";

    rep = rep.slice(0, -2);

    if (training.legLiftsLevel < 6 && app === 3) {
      let message = "Итоги по упражнению\nУровень: " + training.legLiftsLevel +
        "\nУпражнение: " + legLiftsInfo.title + "\nПодходы: " + app +
        "\nПовторения: " + rep;

      const arr = rec.filter(el => el === legLiftsInfo.hardRepetitions);

      if (arr.length === rec.length) {
        training.pushUpsLevel += 1;
        await this.trainingRepository.saveTraining(training);
        message += "\nПоздравляю, ты перешел на уровень" + training.legLiftsLevel;
      }

      legLiftsRecord.isFinished = true;
      await this.trainingRepository.saveLegLifts(legLiftsRecord);

      let nextExercise = JSON.parse(training.currentTraining);
      delete nextExercise["leg-lifts"];

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

    const message = "Раздел: подъемы ног\nУровень: " + training.legLiftsLevel +
      "\nУпражнение: " + legLiftsInfo.title + "\nПодход: " + (app + 1) +
      "\nПовторения: " + rep;

    const keyboard = makeKeyboard(keys);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };

  async checkLegLiftsRecord(tgId: string) {
    const training = await this.trainingRepository.getTraining(tgId);

    const legLiftsRecord = await this.trainingRepository
      .getLegLiftsRecord(training?.id);

    if (!legLiftsRecord) {
      const message = "Не могу найти запись по подъемам ног. Предлагаю" +
        " заново начать тренировку";

      const key = { "Начать тренировку": "/startTraining." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    }
    return { training, legLiftsRecord };
  }

  async checkTrainingDate(tgTime: string, tgId: string,
                          legLiftsRecord: LegLifts) {
    const today = new Date(+tgTime * 1000).toISOString().slice(0, 10);
    const legLiftsDate = legLiftsRecord.createdAt.slice(0, 10);

    if (today !== legLiftsDate) {
      await this.trainingRepository.deleteLegLiftsRecord(legLiftsRecord.id);

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