import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { StartCommand } from "./tg.use.cases/start.uc";
import { AddAthleteInfoCommand } from "./tg.use.cases/add.athlete.info.uc";
import { InputAthleteInfoCommand } from "./tg.use.cases/input.athlete.info.uc";
import { ModAthleteInfoCommand } from "./tg.use.cases/mod.athlete.info.uc";
import { AboutTrainingCommand } from "./tg.use.cases/about.teaining.uc";
import { AboutExercisesCommand } from "./tg.use.cases/about.exercises.us";
import { StartProgramCommand } from "./tg.use.cases/start.program.uc";
import { InputStartDateCommand } from "./tg.use.cases/input.start.date";
import { NextTrainingDateCommand } from "./tg.use.cases/next.training.date.uc";
import { StartTrainingCommand } from "./tg.use.cases/start.trainig.uc";
import { PassTrainingCommand } from "./tg.use.cases/pass.training.uc";
import { GoPushUpsCommand } from "./tg.use.cases/go.push.ups.uc";
import { UnknownCommand } from "./tg.use.cases/unknown.uc";
import { GoLegLiftsCommand } from "./tg.use.cases/go.leg.lifts.uc";
import { GoPullUpsCommand } from "./tg.use.cases/go.pull.ups.uc";
import { GoSquatsCommand } from "./tg.use.cases/go.squats.uc";
import { GoHandstandPushUpsCommand } from "./tg.use.cases/go.handstand.push.ups.uc";
import { GoBridgeCommand } from "./tg.use.cases/go.bridge.uc";

export class TelegramHandlerCommand {
  constructor(public payload: any) {
  };
};

@CommandHandler(TelegramHandlerCommand)
export class TelegramHandlerUseCase
  implements ICommandHandler<TelegramHandlerCommand> {
  constructor(private commandBus: CommandBus) {
  };

  async execute(command: TelegramHandlerCommand) {
    if (!command.payload) return;

    let tgId = command.payload?.message?.chat?.id;
    tgId = tgId || command.payload?.callback_query?.message?.chat?.id;

    let tgName = command.payload?.message?.from?.first_name;
    tgName = tgName || command.payload?.callback_query?.from?.first_name;

    let tgText = command.payload?.message?.text;
    tgText = tgText || command.payload?.callback_query?.data;

    let tgTime = command.payload?.message?.date;
    tgTime = tgTime || command.payload?.callback_query?.message?.date;

    switch (true) {
      case /^\/start\./.test(tgText):
        await this.commandBus.execute(new StartCommand(tgId, tgName));
        break;
      case /\/addMyInfo\./.test(tgText):
        await this.commandBus.execute(new AddAthleteInfoCommand(tgId));
        break;
      case /^[i,I]nfo_[а-я, А-Я]{2,15}_[м,М,ж,Ж]{1}_\d{2}/.test(tgText):
        await this.commandBus.execute(new InputAthleteInfoCommand(tgId, tgText));
        break;
      case /\/modMyInfo\./.test(tgText):
        await this.commandBus.execute(new ModAthleteInfoCommand(tgId));
        break;
      case /^modInfo_[а-я, А-Я]{2,15}_[м,М,ж,Ж]{1}_\d{2}/.test(tgText):
        await this.commandBus.execute(new InputAthleteInfoCommand(tgId, tgText));
        break;
      case /\/aboutTraining\./.test(tgText):
        await this.commandBus.execute(new AboutTrainingCommand(tgId));
        break;
      case /\/aboutExercises\./.test(tgText):
        await this.commandBus.execute(new AboutExercisesCommand(tgId));
        break;
      case /\/startProgram\./.test(tgText):
        await this.commandBus.execute(new StartProgramCommand(tgId));
        break;
      case /^startDate_\d{2}_\d{2}_\d{4}/.test(tgText):
        await this.commandBus.execute(
          new InputStartDateCommand(tgId, tgText, tgTime));
        break;
      case /\/nextTrainingDate\./.test(tgText):
        await this.commandBus.execute(new NextTrainingDateCommand(tgId));
        break;
      case /\/startTraining\./.test(tgText):
        await this.commandBus.execute(new StartTrainingCommand(tgId, tgTime));
        break;
      case /\/passTraining\./.test(tgText):
        await this.commandBus.execute(new PassTrainingCommand(tgId, tgTime));
        break;
      case /\/goPushUps\./.test(tgText):
      case /^\/goPushUps_\d{1,2}/.test(tgText):
        await this.commandBus.execute(new GoPushUpsCommand(tgId, tgTime,
          +tgText.split("_")[1]));
        break;
      case /\/goLegLifts\./.test(tgText):
      case /^\/goLegLifts_\d{1,2}/.test(tgText):
        await this.commandBus.execute(new GoLegLiftsCommand(tgId, tgTime,
          +tgText.split("_")[1]));
        break;
      case /\/goPullUps\./.test(tgText):
      case /^\/goPullUps_\d{1,2}/.test(tgText):
        await this.commandBus.execute(new GoPullUpsCommand(tgId, tgTime,
          +tgText.split("_")[1]));
        break;
      case /\/goSquats\./.test(tgText):
      case /^\/goSquats_\d{1,2}/.test(tgText):
        await this.commandBus.execute(new GoSquatsCommand(tgId, tgTime,
          +tgText.split("_")[1]));
        break;
      case /\/goHandstandPushUps\./.test(tgText):
      case /^\/goHandstandPushUps_\d{1,2}/.test(tgText):
        await this.commandBus.execute(new GoHandstandPushUpsCommand(tgId, tgTime,
          +tgText.split("_")[1]));
        break;
      case /\/goBridge\./.test(tgText):
      case /^\/goBridge_\d{1,2}/.test(tgText):
        await this.commandBus.execute(new GoBridgeCommand(tgId, tgTime,
          +tgText.split("_")[1]));
        break;
      default:
        await this.commandBus.execute(new UnknownCommand(tgId));
        break;
    }
  };
};