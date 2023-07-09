import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TrainingQueryRepository } from "../../inf/training.q.repo";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";

export class StartProgramCommand {
  constructor(public tgId: string) {
  };
};

@CommandHandler(StartProgramCommand)
export class StartProgramUseCase
  implements ICommandHandler<StartProgramCommand> {
  constructor(
    protected trainingQueryRepository: TrainingQueryRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: StartProgramCommand) {
    const tgId = command.tgId;

    const isAthleteExists = await this.trainingQueryRepository
      .getAthlete(tgId);
    if (!isAthleteExists) return;

    const training = await this.trainingQueryRepository.getTraining(tgId);

    if (training) {
      const message = "У тебя уже есть активные тренировки";
      const key = { "Когда следующая тренировка": "/nextTrainingDate" };
      const keyboard = makeKeyboard(key);
      await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
    }

    const nextMonday = new Date();

    const numOfDays = ((7 - nextMonday.getDay()) % 7 + 1) % 7;
    const newDate = nextMonday.getDate() + numOfDays;

    nextMonday.setDate(newDate);
    // console.log(nextMonday);

    const nextNextMonday = new Date(nextMonday);
    nextNextMonday.setDate(nextNextMonday.getDate() + 7);

    const message = "Отлично. Сначала мы будем делать упражнения 1-4," +
      " пока ты не дойдешь до 6 уровня в каждом из них. Занятия будут 2 " +
      "раза в неделю в понедельник и пятницу. Будь готов уделить 30 мин на" +
      " тренировку. Утром в день тренировки я пришлю напоминание." +
      " Когда начнем тренировки?";


    const [fDay, fMonth, fYear, fDate] = this.getFormatDate(nextMonday);
    const [sDay, sMonth, sYear, sDate] = this.getFormatDate(nextNextMonday);

    const keys = {
      [fDate]: `startDate_${fDay}_${fMonth}_${fYear}`,
      [sDate]: `startDate_${sDay}_${sMonth}_${sYear}`
    };

    const keyboard = makeKeyboard(keys); // " Например startDate_01_07_2023";

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  };

  getFormatDate(date) { // для кнопки
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return [day, month, year, `${day}.${month}.${year}`];
  };
};