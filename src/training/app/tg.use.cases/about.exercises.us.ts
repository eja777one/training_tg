import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";

export class AboutExercisesCommand {
  constructor(public tgId: string) {
  };
};

@CommandHandler(AboutExercisesCommand)
export class AboutExercisesUseCase
  implements ICommandHandler<AboutExercisesCommand> {
  constructor(
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: AboutExercisesCommand) {
    const tgId = command.tgId;

    const isAthleteExists = await this.trainingQueryRepository
      .getAthlete(tgId);

    if (!isAthleteExists) return;

    const message = "В программу входят упражнения большой шестерки:\n" +
      "1. Подтягивания (10 уровней)\n2. Отжимания (10 уровней)\n" +
      "3. Подъемы ног (10 уровней)\n4. Приседания (10 уровней)\n" +
      "5. Мосты (10 уровней)\n" +
      "6. Отжимания в стойке на руках (10 уровней)\n";

    const key = { "Начать тренировки": "/startProgram" };
    const keyboard = makeKeyboard(key);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };
}