import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";

export class StartCommand {
  constructor(public tgId: string, public tgName: string) {
  };
};

@CommandHandler(StartCommand)
export class StartUseCase
  implements ICommandHandler<StartCommand> {
  constructor(
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: StartCommand) {
    const { tgId, tgName } = command;

    const isAthleteExists = await this.trainingQueryRepository
      .getAthlete(tgId);

    if (isAthleteExists) {
      const message = `Привет ${isAthleteExists.name}!\nЯ рад что ты вернулся!`;

      const key = { "Показать следующую тренировку": "/nextTrainingDate" };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    const message = `Привет ${tgName}! Для начала расскажи о себе`;

    const key = { "Добавить инфо обо мне": "/addMyInfo" };
    const keyboard = makeKeyboard(key);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  }
};