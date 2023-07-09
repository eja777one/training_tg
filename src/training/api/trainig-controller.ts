import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { TelegramHandlerCommand } from "../app/telegram.handler.uc";

@Controller()
export class TrainingController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {
  };

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("telegram/webhook")
  async setWebhook(@Body() payload: any) {
    console.log(payload);
    // const text = payload?.message?.text;
    // const id = payload?.message?.chat?.id;
    await this.commandBus.execute(new TelegramHandlerCommand(payload));
  };
}
