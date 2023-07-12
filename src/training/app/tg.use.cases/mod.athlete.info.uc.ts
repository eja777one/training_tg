import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";

export class ModAthleteInfoCommand {
  constructor(public tgId: string) {
  };
};

@CommandHandler(ModAthleteInfoCommand)
export class ModAthleteInfoUseCase
  implements ICommandHandler<ModAthleteInfoCommand> {
  constructor(
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: ModAthleteInfoCommand) {
    const tgId = command.tgId;

    const isAthleteExists = await this.trainingQueryRepository
      .getAthlete(tgId);

    if (!isAthleteExists) {
      const message = "Ты ранее не сообщал информацию о себе";

      const key = { "Добавить инфо обо мне": "/addMyInfo." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    const message = "Давай изменим информацию о тебе." +
      "\nФормат: modInfo_имя_пол_возраст\n" +
      "Например: modInfo_Александр_м_25";
    await this.telegramAdapter.sendMessage(message, +tgId);
  };
}