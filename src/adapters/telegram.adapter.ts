import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";

@Injectable()
export class TelegramAdapter {
  private axiosInstance: AxiosInstance;
  static url: string;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/bot${process.env.TG_TOKEN}`
    });
  }

  async sendMessage(text: string, recipientId: number, keyboard?: string) {
    if (keyboard) {
      await this.axiosInstance.post(
        `sendMessage`,
        { chat_id: recipientId, text: text, reply_markup: keyboard }
      );
    } else {
      await this.axiosInstance.post(
        `sendMessage`,
        { chat_id: recipientId, text: text }
      );
    }
  };

  async setWebhook(url: string) {
    TelegramAdapter.url = url;
    console.log(url);
    await this.axiosInstance.post(`setWebhook`, { url });
    console.log("TG BOT was started");
  };

  async echo() {
    const url = process.env.BASE_URL || "http://localhost:3004";
    await axios.post(url + "/echo",
      { url: TelegramAdapter.url, baseUrl: url, tgToken: process.env.TG_TOKEN });
  }
}