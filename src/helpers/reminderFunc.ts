import TelegramBot, {
  InlineKeyboardMarkup,
  CallbackQuery,
} from "node-telegram-bot-api";

let eyeIntervalId: NodeJS.Timeout | undefined;
let exerciseIntervalId: NodeJS.Timeout | undefined;

interface ReminderProps {
  bot: TelegramBot;
  chatId: number;
  reminderType: "eyes" | "exercises";
}

const handleReminderFunction = ({
  bot,
  chatId,
  reminderType,
}: ReminderProps) => {
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        {
          text: "Удалить напоминание",
          callback_data: `delete_${reminderType}_reminder`,
        },
      ],
    ],
  };

  const reminderMessage: Record<"eyes" | "exercise", string> = {
    eyes: "*Время для перерыва!* \n\nПроведите несколько минут на отдых и разминку глаз.",
    exercise:
      "*Время для упражнений!* \n\nСделайте несколько упражнений для поддержания здоровья.",
  };

  const reminderText: string =
    reminderType === "eyes" ? reminderMessage.eyes : reminderMessage.exercise;

  bot.sendMessage(
    chatId,
    `Вы выбрали функцию "${
      reminderType === "eyes" ? "Глаза" : "Упражнения"
    }". \n\nВведите интервал напоминаний в *минутах(число)*:`,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );

  const onDeleteCallbackQuery = (callbackQyery: CallbackQuery) => {
    if (!callbackQyery.message) return;
    const data = callbackQyery.data;
    const chatId = callbackQyery.message.chat.id;

    if (data === `delete_${reminderType}_reminder`) {
      if (reminderType === "eyes" && eyeIntervalId) {
        clearInterval(eyeIntervalId);
        eyeIntervalId = undefined;
        bot.sendMessage(chatId, "Напоминание о глазах удалено.");
      } else if (reminderType === "exercises" && exerciseIntervalId) {
        clearInterval(exerciseIntervalId);
        exerciseIntervalId = undefined;
        bot.sendMessage(chatId, "Напоминание об упражнениях удалено.");
      }
      bot.removeListener("callback_query", onDeleteCallbackQuery);
      bot.removeAllListeners("message");
    }
  };

  bot.on("callback_query", onDeleteCallbackQuery);

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      bot.sendMessage(chatId, "Введите число в минутах.");
      return;
    }

    const inputText = msg.text.trim();
    const isValidInput = /^\d+$/.test(inputText);

    if (!isValidInput) {
      bot.sendMessage(chatId, "Пожалуйста, введите только числа.");
      return;
    }
    const interval = parseInt(inputText);

    bot.sendMessage(
      chatId,
      `Интервал напоминаний успешно установлен на ${interval} минут.`
    );

    bot.removeAllListeners("message");

    if (reminderType === "eyes") {
      if (eyeIntervalId) {
        clearInterval(eyeIntervalId);
      }
      eyeIntervalId = setInterval(() => {
        bot.sendMessage(chatId, reminderText, {
          parse_mode: "Markdown",
        });
      }, interval * 1000);
    } else if (reminderType === "exercises") {
      if (exerciseIntervalId) {
        clearInterval(exerciseIntervalId);
      }
      exerciseIntervalId = setInterval(() => {
        bot.sendMessage(chatId, reminderText, {
          parse_mode: "Markdown",
        });
      }, interval * 1000);
    }
  });
};

export default handleReminderFunction;
