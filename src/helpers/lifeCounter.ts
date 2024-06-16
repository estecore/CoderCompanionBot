import TelegramBot, {
  InlineKeyboardMarkup,
  CallbackQuery,
} from "node-telegram-bot-api";
import fs from "fs";
import path from "path";

const LIFE_EXPECTANCY = 75;

interface UserData {
  [chatId: number]: {
    birthdate?: string;
  };
}

const userDataPath = path.join(__dirname, "userData.json");
let reminderIntervals: { [chatId: number]: NodeJS.Timeout } = {};

const loadUserData = (): UserData => {
  if (fs.existsSync(userDataPath)) {
    const rawData = fs.readFileSync(userDataPath, "utf8");
    return JSON.parse(rawData);
  }
  return {};
};

const saveUserData = (data: UserData) => {
  fs.writeFileSync(userDataPath, JSON.stringify(data, null, 2));
};

const calculateRemainingDays = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  const lifeExpectancyDate = new Date(
    birth.setFullYear(birth.getFullYear() + LIFE_EXPECTANCY)
  );
  const remainingTime = lifeExpectancyDate.getTime() - today.getTime();
  return Math.floor(remainingTime / (1000 * 60 * 60 * 24));
};

const isValidDate = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

const setDailyReminder = (
  bot: TelegramBot,
  chatId: number,
  birthdate: string
) => {
  const sendReminder = () => {
    const remainingDays = calculateRemainingDays(birthdate);
    bot.sendMessage(
      chatId,
      `Напоминание: у вас осталось примерно ${remainingDays} дней жизни. \n\nНе упускайте ни единой минуты жизни!`,
      { parse_mode: "Markdown" }
    );
  };

  if (reminderIntervals[chatId]) {
    clearInterval(reminderIntervals[chatId]);
  }
  reminderIntervals[chatId] = setInterval(sendReminder, 1000 * 60 * 60 * 23);
};

const handleLifeCounter = ({
  bot,
  chatId,
}: {
  bot: TelegramBot;
  chatId: number;
}) => {
  const userData = loadUserData();

  if (userData[chatId] && userData[chatId].birthdate) {
    const birthdate = userData[chatId].birthdate;
    if (birthdate) {
      const remainingDays = calculateRemainingDays(birthdate);

      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
          [
            {
              text: "Удалить дату рождения",
              callback_data: "delete_birthdate",
            },
          ],
        ],
      };

      bot.sendMessage(
        chatId,
        `У вас осталось примерно ${remainingDays} дней жизни. \n\nНе упускайте ни единой минуты жизни!`,
        {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        }
      );

      setDailyReminder(bot, chatId, birthdate);

      bot.on("callback_query", (callbackQuery: CallbackQuery) => {
        if (!callbackQuery.message) {
          return;
        }
        if (callbackQuery.data === "delete_birthdate") {
          delete userData[chatId].birthdate;
          saveUserData(userData);
          bot.sendMessage(chatId, "Ваша дата рождения была удалена из данных.");
          clearInterval(reminderIntervals[chatId]);
          delete reminderIntervals[chatId];

          bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
              chat_id: callbackQuery.message.chat.id,
              message_id: callbackQuery.message.message_id,
            }
          );
        }
      });

      return;
    }
  }

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        {
          text: "Отмена",
          callback_data: "cancel_life_counter",
        },
      ],
    ],
  };

  bot.sendMessage(
    chatId,
    "Для подсчёта оставшихся дней жизни введите вашу дату рождения в формате ГГГГ-ММ-ДД:",
    {
      reply_markup: keyboard,
    }
  );

  bot.on("callback_query", (callbackQuery: CallbackQuery) => {
    if (!callbackQuery.message) {
      return;
    }
    if (callbackQuery.data === "cancel_life_counter") {
      bot.sendMessage(chatId, "Команда 'Остаток дней жизни' отменена.");
      bot.removeAllListeners("message");
      bot.removeAllListeners("callback_query");
    }
  });

  const messageListener = (msg: TelegramBot.Message) => {
    if (msg.chat.id !== chatId) return;
    const birthdate = msg.text?.trim();

    if (!birthdate || !isValidDate(birthdate)) {
      bot.sendMessage(
        chatId,
        "Пожалуйста, введите дату рождения в правильном формате (ГГГГ-ММ-ДД)."
      );
      return;
    }

    userData[chatId] = { birthdate };
    saveUserData(userData);

    const remainingDays = calculateRemainingDays(birthdate);
    const keyboard: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: "Удалить дату рождения",
            callback_data: "delete_birthdate",
          },
        ],
      ],
    };

    bot.sendMessage(
      chatId,
      `У вас осталось примерно ${remainingDays} дней жизни. \n\nНе упускайте ни единой минуты жизни!`,
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      }
    );
    bot.removeListener("message", messageListener);

    setDailyReminder(bot, chatId, birthdate);

    bot.on("callback_query", (callbackQuery: CallbackQuery) => {
      if (!callbackQuery.message) {
        return;
      }
      if (callbackQuery.data === "delete_birthdate") {
        delete userData[chatId].birthdate;
        saveUserData(userData);
        bot.sendMessage(chatId, "Ваша дата рождения была удалена из данных.");
        clearInterval(reminderIntervals[chatId]);
        delete reminderIntervals[chatId];

        bot.editMessageReplyMarkup(
          { inline_keyboard: [] },
          {
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
          }
        );
      }
    });
  };

  bot.on("message", messageListener);
};

export default handleLifeCounter;
