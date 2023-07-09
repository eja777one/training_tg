import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TelegramAdapter } from "../../../adapters/telegram.adapter";
import { makeKeyboard } from "../../../application/make.keyboard";
import { Athlete } from "../../dom/athlete.entity";
import { randomUUID } from "crypto";
import { TrainingRepository } from "../../inf/training.db.repo";

export class InputAthleteInfoCommand {
  constructor(public tgId: string, public tgText: string) {
  };
};

@CommandHandler(InputAthleteInfoCommand)
export class InputAthleteInfoUseCase
  implements ICommandHandler<InputAthleteInfoCommand> {
  constructor(
    protected trainingRepository: TrainingRepository,
    protected telegramAdapter: TelegramAdapter
  ) {
  };

  async execute(command: InputAthleteInfoCommand) {
    const { tgId, tgText } = command;

    const parseMessage = tgText.split("_");
    if (parseMessage.length < 4) return;

    let athlete = await this.trainingRepository.getAthlete(tgId);

    if (!athlete) {
      athlete = new Athlete();
      athlete.id = randomUUID();
      athlete.name = parseMessage[1];
      athlete.sex = parseMessage[2];
      athlete.age = parseMessage[3];
      athlete.createdAt = new Date().toString();
      athlete.telegramId = tgId;
    } else {
      athlete.name = parseMessage[1];
      athlete.sex = parseMessage[2];
      athlete.age = parseMessage[3];
    }
    
    const saved = await this.trainingRepository.saveAthlete(athlete);

    if (!saved) {
      const message = "Ой, произошла ошибка. Попробуй позже";
      await this.telegramAdapter.sendMessage(message, +tgId);
    }

    const message = "Данные записаны!";

    const key = { "Узнать о тренировках": "/aboutTraining" };
    const keyboard = makeKeyboard(key);

    await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  }
};