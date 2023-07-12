import { Body, Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { TelegramAdapter } from "./adapters/telegram.adapter";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly telegramAdapter: TelegramAdapter
  ) {
  }

  @Get()
  async helloWorld(): Promise<string> {
    // const tgUrl = process.env.BASE_URL + process.env.TG_END_POINT;
    // // await this.telegramAdapter.echo();
    // // await this.telegramAdapter.setWebhook(tgUrl);
    // console.log(1);
    return "TG BOT was started";
  }

  @Get("startBot")
  async startBot(): Promise<string> {
    const tgUrl = process.env.BASE_URL + process.env.TG_END_POINT;
    await this.telegramAdapter.echo();
    await this.telegramAdapter.setWebhook(tgUrl);
    console.log(123);
    return "TG BOT was started";
  }

  @Post("test-button")
  async buttonTest(@Body() payload: any) {
    console.log("Hello!");
    console.log(payload);
  }

  @Post("echo")
  async logMessage(@Body() payload: any) {
    console.log(payload);
  }


}