import TelegramBot, {
  InlineKeyboardMarkup,
  CallbackQuery,
} from "node-telegram-bot-api";

let intervalId: NodeJS.Timeout | undefined;

const handleReminderFunction = (bot: TelegramBot, chatId: number) => {
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: "Удалить напоминание", callback_data: "delete_reminder" }],
    ],
  };
  bot.sendMessage(
    chatId,
    `Вы выбрали функцию "Напоминания". \n\nВведите интервал напоминаний в *минутах(число)*:`,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );

  bot.on("callback_query", (callbackQuery: CallbackQuery) => {
    if (!callbackQuery.message) {
      return;
    }
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;

    switch (data) {
      case "delete_reminder": {
        if (intervalId) {
          clearInterval(intervalId);
          bot.sendMessage(chatId, "Напоминание удалено.");
        }
        break;
      }
    }
  });

  bot.onText(/.*/, (msg) => {
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

    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
      bot.sendMessage(
        chatId,
        `*Время для перерыва!* \n\nПроведите несколько минут на отдых и разминку глаз.`,
        {
          parse_mode: "Markdown",
        }
      );
    }, interval * 1000);
  });
};

export default handleReminderFunction;
