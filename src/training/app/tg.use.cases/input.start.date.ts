import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { Training } from "../../dom/training.entity";
import { TrainingRepository } from "../../inf/training.db.repo";

export class InputStartDateCommand {
  constructor(public tgId: string, public tgText: string,
              public tgTime: string) {
  };
};

@CommandHandler(InputStartDateCommand)
export class InputStartDateUseCase
  implements ICommandHandler<InputStartDateCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: InputStartDateCommand) {
    const { tgId, tgText, tgTime } = command;

    const athlete = await this.trainingQueryRepository.getAthlete(tgId);
    if (!athlete) return;

    const isActiveTraining = await this.trainingQueryRepository
      .getTraining(tgId);

    if (isActiveTraining) {
      const message = "У тебя уже есть активные тренировки";
      const key = { "Когда следующая тренировка": "/nextTrainingDate." };
      const keyboard = makeKeyboard(key);
      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    }
    const parseMessage = tgText.split("_");
    if (parseMessage.length < 4) return;

    const date = new Date(Date.UTC(+parseMessage[3], +parseMessage[2] - 1,
      +parseMessage[1], 0, 0, 0));
    console.log(date);

    const minDate = new Date(+tgTime * 1000);
    // console.log(minDate);

    const maxDate = new Date(minDate);
    maxDate.setMonth(maxDate.getMonth() + 1);
    // console.log(maxDate);

    if (date < minDate || date > maxDate) {
      const message = "Кажется, что-то не так с датой. " +
        "Давай попробуем начать заново";

      const key = { "Начать тренировки": "/startProgram." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    // const nextMonday = new Date(date.getTime());
    //
    // const numOfDays = ((7 - nextMonday.getDay()) % 7 + 1) % 7;
    // const newDate = nextMonday.getDate() + numOfDays;
    //
    // nextMonday.setDate(newDate);
    // console.log(nextMonday);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formatDate = `${day}.${month}.${year}`;

    const training = new Training();
    training.athleteId = athlete.id;
    training.startedAt = training.nextTrainingDate = date.toISOString();

    const saveTraining = await this.trainingRepository.saveTraining(training);

    if (!saveTraining) {
      const message = "Ой, произошла ошибка. Давай попробуем начать тренировки заново";
      const key = { "Начать тренировки": "/startProgram." };
      const keyboard = makeKeyboard(key);

      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
      return;
    }

    const message = "Данные сохранены. Первая тренировака состоится " +
      formatDate + ". Я пришлю уведомление";

    const key = { "Когда следующая тренировка": "/nextTrainingDate." };
    const keyboard = makeKeyboard(key);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };
};