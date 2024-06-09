import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN must be provided in the .env file");
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start|Start|Старт/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Привет! Я ваш бот-помощник. Я буду помогать вам отслеживать перерывы для глаз, делать физические упражнения и даже отсчитывать оставшиеся дни вашей жизни. Используйте /setreminder, /setbirthdate и /lifecount для настройки напоминаний и просмотра оставшегося времени."
  );
});

console.log("Bot is running!");
