import { ConfigModule } from "@nestjs/config";

const configModule = ConfigModule
  .forRoot({ envFilePath: [".env.local", ".env"] });
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TelegramAdapter } from "./adapters/telegram.adapter";
import { TrainingModule } from "./training/training.module";
import { ScheduleModule } from "@nestjs/schedule";
import { TrainingQueryRepository } from "./training/inf/training.q.repo";


@Module({
  imports: [
    CqrsModule,
    configModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE,
        autoLoadEntities: true,
        synchronize: true
      }
    ),
    TrainingModule
  ],
  controllers: [AppController],
  providers: [AppService, TelegramAdapter, TrainingQueryRepository]
})
export class AppModule {
}
