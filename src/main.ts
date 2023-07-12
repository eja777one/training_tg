import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { TelegramAdapter } from "./adapters/telegram.adapter";
import ngrok from "ngrok";

async function connectToNgrok() {
  await ngrok.authtoken('2RThk0u9dPJDMwQXK8OxYMTNsn2_MDyH56spazSioUTYL8YB');
  const url = await ngrok.connect(3004);
  return url;
}

async function bootstrap() {
  let baseUrl = process.env.BASE_URL || "http://localhost:3004";

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const telegramAdapter = await app.resolve(TelegramAdapter);

  if (process.env.NODE_ENV === "development") {
    baseUrl = await connectToNgrok();
  }

  console.log(baseUrl);

  // const tgUrl = baseUrl + process.env.TG_END_POINT;

  await app.listen(3004);
  console.log(2);

  // await telegramAdapter.echo();
  // await telegramAdapter.setWebhook(tgUrl);
  console.log(3);
}

bootstrap();