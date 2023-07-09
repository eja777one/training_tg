import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TelegramAdapter } from "./adapters/telegram.adapter";
import { TrainingQueryRepository } from "./training/inf/training.q.repo";
import { makeKeyboard } from "./application/make.keyboard";

@Injectable()
export class AppService {

  constructor(
    protected telegramAdapter: TelegramAdapter,
    protected trainingQueryRepository: TrainingQueryRepository
  ) {
  }

  getHello(): string {
    return "Hello World!";
  }

  private readonly logger = new Logger(AppService.name);

  // @Cron("10 * * * * *")
  // @Cron(CronExpression.EVERY_30_SECONDS)
  // async handleCron() {
  //   console.log("Hello!");
  //   this.logger.debug("Called every 30 sec");
  //   const athletes = await this.trainingQueryRepository
  //     .getAthletesForNotification();
  //
  //   const message = "Приветствую тебя спортсмен! У тебя сегодня тренировака";
  //
  //   const keys = {
  //     "Начать": "/startTraining",
  //     "Пропустить": "/passTraining"
  //   };
  //
  //   const keyboard = makeKeyboard(keys);
  //
  //   for (let tgId of athletes) {
  //     await this.telegramAdapter.sendMessage(message, +tgId, keyboard);
  //   }
  //
  //   // await this.telegramAdapter.sendMessage("Ok", 496489380);
  // }
}
