import TelegramBot, { InlineKeyboardMarkup } from "node-telegram-bot-api";
import * as dotenv from "dotenv";

import handleReminderFunction from "./helpers/reminderFunc";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN must be provided in the .env file");
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start|start|старт/i, (msg) => {
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: "Напоминания", callback_data: "reminders" },
        { text: "Упражнения", callback_data: "exercises" },
      ],
      [{ text: "Остаток дней жизни", callback_data: "lifecount" }],
    ],
  };

  bot.sendMessage(
    msg.chat.id,
    `
*Привет!* Я ваш *Бот-помощник*. 
Я буду помогать вам отслеживать перерывы для глаз, делать физические упражнения 
и даже отсчитывать оставшиеся дни вашей жизни.

Пожалуйста, выберите интересующую вас функцию:
    `,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
});

bot.on("callback_query", (callbackQuery) => {
  if (!callbackQuery.message) {
    return;
  }

  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  switch (data) {
    case "reminders": {
      handleReminderFunction(bot, chatId);
      break;
    }
  }
});

console.log("Bot is running!");
