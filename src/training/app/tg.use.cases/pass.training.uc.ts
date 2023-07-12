import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { NotFoundException } from "@nestjs/common";
import { TrainingRepository } from "../../inf/training.db.repo";

export class PassTrainingCommand {
  constructor(public tgId: string, public tgTime: string) {
  };
};

@CommandHandler(PassTrainingCommand)
export class PassTrainingUseCase
  implements ICommandHandler<PassTrainingCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: PassTrainingCommand) {
    const { tgId, tgTime } = command;

    const training = await this.trainingRepository.getTraining(tgId);
    if (!training) {
      const message = "Не могу найти следующую тренировку. Предлагаю" +
        " посмотреть программу упражнений и начать тренировки";

      const key = { "Посмотреть упражнения": "/aboutExercises." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    const today = new Date(+tgTime * 1000).toISOString().slice(0, 10);
    const nextTraining = training.nextTrainingDate.slice(0, 10);

    // console.log(today);
    // console.log(nextTraining);

    if (today < nextTraining) {
      const message = "Кажется твоя тренировка не сегодня";

      const key = { "Когда следующая тренировка": "/nextTrainingDate." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    } else if (today > nextTraining) {
      let today = new Date();
      let nextDate = new Date(training.nextTrainingDate);

      while (today > nextDate) {
        nextDate.setDate(nextDate.getDate() + 7);
        console.log(nextDate);
      }

      training.nextTrainingDate = nextDate.toISOString();

      const saveTraining = await this.trainingRepository
        .saveTraining(training);
      if (!saveTraining) throw new NotFoundException();

      const message = "Кажется ты пропустил тренировку. Поэтому я ее перенес";

      const key = { "Когда следующая тренировка": "/nextTrainingDate." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    let nextDate = new Date(training.nextTrainingDate);
    nextDate.setDate(nextDate.getDate() + 7);

    training.nextTrainingDate = nextDate.toISOString();

    const saveTraining = await this.trainingRepository
      .saveTraining(training);
    if (!saveTraining) throw new NotFoundException();

    const message = "Я перенес твою тренировку";

    const key = { "Когда следующая тренировка": "/nextTrainingDate." };
    const keyboard = makeKeyboard(key);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };
};