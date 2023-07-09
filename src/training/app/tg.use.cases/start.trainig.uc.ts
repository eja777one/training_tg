import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { NotFoundException } from "@nestjs/common";
import { TrainingRepository } from "../../inf/training.db.repo";
import { PushUps } from "../../dom/exercises/push.ups.entity";
import { LegLifts } from "../../dom/exercises/leg.lifts.entity";
import { exercises } from "../../training.types";
import { Training } from "../../dom/training.entity";
import { PullUps } from "../../dom/exercises/pull.ups.entity";
import { Squats } from "../../dom/exercises/squats.entity";
import { HandstandPushUps } from "../../dom/exercises/handstand.push.ups.entity";
import { Bridge } from "../../dom/exercises/bridge.etity";

export class StartTrainingCommand {
  constructor(public tgId: string, public tgTime: string) {
  };
};

@CommandHandler(StartTrainingCommand)
export class StartTrainingUseCase
  implements ICommandHandler<StartTrainingCommand> {

  constructor(
    protected trainingRepository: TrainingRepository,
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: StartTrainingCommand) {
    const { tgId, tgTime } = command;

    const training = await this.checkTraining(tgId);
    if (!training) return;

    const isTrainingToday = await this.checkDate(tgTime, tgId, training);
    if (!isTrainingToday) return;

    const trainingInfo = await this.trainingQueryRepository.getTrainingInfo(
      training.currentProgram, new Date().getDay());

    if (!trainingInfo) throw new NotFoundException();

    training.currentTraining = trainingInfo;
    await this.trainingRepository.saveTraining(training);

    const trainingObj = JSON.parse(trainingInfo);

    let date = new Date().toISOString();
    date = date.slice(0, -13) + "00:00:00.000Z";

    let addMessage = "";
    const keys = {};

    for (let key of Object.keys(trainingObj)) {
      switch (key) {
        case "push-ups":
          keys["Начать отжимания"] = "/goPushUps";
          addMessage += exercises[key] + " и ";
          await this.trainingRepository.savePushUps(
            new PushUps(date, training.id));
          break;
        case "leg-lifts":
          keys["Начать подъемы ног"] = "/goLegLifts";
          addMessage += exercises[key] + " и ";
          await this.trainingRepository.saveLegLifts(
            new LegLifts(date, training.id));
          break;
        case "pull-ups":
          keys["Начать подтягивания"] = "/goPullUps";
          addMessage += exercises[key] + " и ";
          await this.trainingRepository.savePullUps(
            new PullUps(date, training.id));
          break;
        case "squats":
          keys["Начать приседания"] = "/goSquats";
          addMessage += exercises[key] + " и ";
          await this.trainingRepository.saveSquats(
            new Squats(date, training.id));
          break;
        case "handstand-push-ups":
          keys["Начать отжимания в стойке"] = "/goHandstandPushUps";
          addMessage += exercises[key] + " и ";
          await this.trainingRepository.saveHandstandPushUps(
            new HandstandPushUps(date, training.id));
          break;
        case "bridge":
          keys["Начать мосты"] = "/goBridge";
          addMessage += exercises[key] + " и ";
          await this.trainingRepository.saveBridge(
            new Bridge(date, training.id));
          break;
      }
    }

    addMessage = addMessage.slice(0, -3);

    const message = "Отлично! Сегодня на тренировке: " + addMessage;
    const keyboard = makeKeyboard(keys);
    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };

  async checkTraining(tgId: string) {
    const training = await this.trainingRepository.getTraining(tgId);
    if (!training) {
      const message = "Не могу найти следующую тренировку. Предлагаю" +
        " посмотреть программу упражнений и начать тренировки";

      const key = { "Посмотреть упражнения": "/aboutExercises" };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return null;
    }
    return training;
  };

  async checkDate(tgTime: string, tgId: string, training: Training) {
    const today = new Date(+tgTime * 1000).toISOString().slice(0, 10);
    const nextTraining = training.nextTrainingDate.slice(0, 10);

    if (today < nextTraining) {
      const message = "Кажется твоя тренировка не сегодня";

      const key = { "Когда следующая тренировка": "/nextTrainingDate" };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return false;

    } else if (today > nextTraining) {

      let today = new Date();
      let nextDate = new Date(training.nextTrainingDate);

      while (today > nextDate) nextDate.setDate(nextDate.getDate() + 7);

      training.nextTrainingDate = nextDate.toISOString();
      await this.trainingRepository.saveTraining(training);

      const message = "Кажется ты пропустил тренировку. Поэтому я ее перенес";

      const key = { "Когда следующая тренировка": "/nextTrainingDate" };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return false;
    }
    return true;
  };
};