import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { TrainingRepository } from "../../inf/training.db.repo";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { Bridge } from "../../dom/exercises/bridge.etity";

export class GoBridgeCommand {
  constructor(public tgId: string, public tgTime: string,
              public count: number | undefined) {
  };
};

@CommandHandler(GoBridgeCommand)
export class GoBridgeUseCase
  implements ICommandHandler<GoBridgeCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: GoBridgeCommand) {
    const { tgId, tgTime, count } = command;
    const { training, bridgeRecord } = await this.checkBridgeRecord(tgId);
    if (!bridgeRecord) return;

    if (count) {
      const temp = JSON.parse(bridgeRecord.records);
      temp.push(count);
      bridgeRecord.records = JSON.stringify(temp);
      await this.trainingRepository.saveBridge(bridgeRecord);
    }

    const isTrainingToday = await this
      .checkTrainingDate(tgTime, tgId, bridgeRecord);
    if (!isTrainingToday) return;

    const bridgeInfo = await this.trainingQueryRepository
      .getBridgeInfo(training.squatsLevel);

    const keys = {};
    keys[bridgeInfo.easyRepetitions] = `/goBridge_${bridgeInfo.easyRepetitions}`;
    keys[bridgeInfo.middleRepetitions] = `/goBridge_${bridgeInfo.middleRepetitions}`;
    keys[bridgeInfo.hardRepetitions] = `/goBridge_${bridgeInfo.hardRepetitions}`;

    const rec = JSON.parse(bridgeRecord.records);
    const app = rec.length;

    let rep = "";
    for (let el of rec) rep += el + ", ";

    rep = rep.slice(0, -2);

    if (training.bridgeLevel < 6 && app === 3) {
      let message = "Итоги по упражнению\nУровень: " + training.bridgeLevel +
        "\nУпражнение: " + bridgeInfo.title + "\nПодходы: " + app +
        "\nПовторения: " + rep;

      const arr = rec.filter(el => el === bridgeInfo.hardRepetitions);

      if (arr.length === rec.length) {
        training.bridgeLevel += 1;
        await this.trainingRepository.saveTraining(training);
        message += "\nПоздравляю, ты перешел на уровень" + training.bridgeLevel;
      }

      bridgeRecord.isFinished = true;
      await this.trainingRepository.saveSquats(bridgeRecord);

      let nextExercise = JSON.parse(training.currentTraining);
      delete nextExercise["bridge"];

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

    const message = "Раздел: подъемы ног\nУровень: " + training.bridgeLevel +
      "\nУпражнение: " + bridgeInfo.title + "\nПодход: " + (app + 1) +
      "\nПовторения: " + rep;

    const keyboard = makeKeyboard(keys);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };

  async checkBridgeRecord(tgId: string) {
    const training = await this.trainingRepository.getTraining(tgId);

    const bridgeRecord = await this.trainingRepository
      .getBridgeRecord(training?.id);

    if (!bridgeRecord) {
      const message = "Не могу найти запись по мостам. Предлагаю" +
        " заново начать тренировку";

      const key = { "Начать тренировку": "/startTraining." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    }
    return { training, bridgeRecord };
  }

  async checkTrainingDate(tgTime: string, tgId: string, bridgeRecord: Bridge) {
    const today = new Date(+tgTime * 1000).toISOString().slice(0, 10);
    const bridgeDate = bridgeRecord.createdAt.slice(0, 10);

    if (today !== bridgeDate) {
      await this.trainingRepository.deleteBridgeRecord(bridgeRecord.id);

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