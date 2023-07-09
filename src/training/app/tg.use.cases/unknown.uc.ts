import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";

export class UnknownCommand {
  constructor(public tgId: string) {
  };
};

@CommandHandler(UnknownCommand)
export class UnknownUseCase
  implements ICommandHandler<UnknownCommand> {
  constructor(protected telegramAdapter: TelegramAdapter) {
  };

  async execute(command: UnknownCommand) {
    const tgId = command.tgId;

    const message = "Не удалось распознать комманду";

    const key = { "Попробовать еще раз": "/start" };
    const keyboard = makeKeyboard(key);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    return;
  }
};