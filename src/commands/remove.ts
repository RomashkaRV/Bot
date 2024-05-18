import Links from "@services/links";

import { bot } from "@commands";

import { Message } from "node-telegram-bot-api";

export default async function remove(msg: Message, match: RegExpMatchArray | null) {
  const chatId = msg.chat.id;

  if (!match) {
    return bot.sendMessage(chatId, "Нет такого id");
  }

  const id = +match[1];

  try {
    const result = await Links.remove(chatId, id);
    return bot.sendMessage(chatId, result);
  } catch (error) {
    if (error instanceof Error) {
      return bot.sendMessage(chatId, `Ошибка: ${error.message}`);
    } else {
      return bot.sendMessage(chatId, "Произошла неизвестная ошибка");
    }
  }
}
