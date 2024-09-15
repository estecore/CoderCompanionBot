import TelegramBot, { ReplyKeyboardMarkup } from "node-telegram-bot-api";
import * as dotenv from "dotenv";

import handleReminderFunction from "./helpers/reminderFunc";
import handleLifeCounter from "./helpers/lifeCounter";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN must be provided in the .env file");
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start|start|старт/i, (msg) => {
  const keyboard: ReplyKeyboardMarkup = {
    keyboard: [
      [{ text: "Глаза" }, { text: "Упражнения" }],
      [{ text: "Остаток дней жизни" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };

  bot.sendMessage(
    msg.chat.id,
    `*Привет!* Я Ваш *Бот-помощник*. \n\nЯ буду помогать вам: \n- отслеживать *перерывы для глаз* \n- делать *физические упражнения* \n- и даже отсчитывать *оставшиеся дни вашей жизни* \n\nПожалуйста, выберите интересующую вас функцию:`,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
});

bot.onText(/Глаза|eyes/i, (msg) => {
  handleReminderFunction({ bot, chatId: msg.chat.id, reminderType: "eyes" });
});

bot.onText(/Упражнения|exercises/i, (msg) => {
  handleReminderFunction({
    bot,
    chatId: msg.chat.id,
    reminderType: "exercises",
  });
});

bot.onText(/Остаток дней жизни|lifecount/i, (msg) => {
  handleLifeCounter({ bot, chatId: msg.chat.id });
});

console.log("Bot is running!");
