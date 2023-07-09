import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";

export class AddAthleteInfoCommand {
  constructor(public tgId: string) {
  };
};

@CommandHandler(AddAthleteInfoCommand)
export class AddAthleteInfoUseCase
  implements ICommandHandler<AddAthleteInfoCommand> {
  constructor(
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: AddAthleteInfoCommand) {
    const tgId = command.tgId;

    const isAthleteExists = await this.trainingQueryRepository
      .getAthlete(tgId);

    if (isAthleteExists) {
      const message = "Ты ранее сообщал информацию о себе";

      const key = { "Изменить инфо обо мне": "/modMyInfo" };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    const message = "Давай добавим информацию о тебе.\nФормат: " +
      "info_имя_пол_возраст\nНапример: info_Александр_м_25";
    await this.telegramAdapter.sendMessage(message, +tgId);
  }
};