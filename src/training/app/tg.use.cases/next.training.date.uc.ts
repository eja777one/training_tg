import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";

export class NextTrainingDateCommand {
  constructor(public tgId: string) {
  };
};

@CommandHandler(NextTrainingDateCommand)
export class NextTrainingDateUseCase
  implements ICommandHandler<NextTrainingDateCommand> {
  constructor(
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: NextTrainingDateCommand) {
    const tgId = command.tgId;

    const training = await this.trainingQueryRepository
      .getTraining(tgId);

    if (!training) {
      const message = "Не могу найти следующую тренировку. Предлагаю" +
        " посмотреть программу упражнений и начать тренировки";

      const key = { "Посмотреть упражнения": "/aboutExercises." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    const date = new Date(training.nextTrainingDate);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const formatDate = `${day}.${month}.${year}`;

    const message = "Следующая тренировака состоится " + formatDate +
      ". Я пришлю уведомление";
    await this.telegramAdapter.sendMessage(message, +tgId);
  };
};