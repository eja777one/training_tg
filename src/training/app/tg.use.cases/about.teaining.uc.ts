import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";

export class AboutTrainingCommand {
  constructor(public tgId: string) {
  };
};

@CommandHandler(AboutTrainingCommand)
export class AboutTrainingUseCase
  implements ICommandHandler<AboutTrainingCommand> {
  constructor(
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: AboutTrainingCommand) {
    const tgId = command.tgId;

    const isAthleteExists = await this.trainingQueryRepository
      .getAthlete(tgId);

    if (!isAthleteExists) return;

    const message = "Я @Super_Self_Training_Bot. Я помогу записывать твои" +
      " тренировки по программе: 'Тренировки заключенных'";

    const key = { "Посмотреть упражнения": "/aboutExercises" };
    const keyboard = makeKeyboard(key);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };
}