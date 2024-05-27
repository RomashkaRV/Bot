import Links from "@services/links";

import numberFormat from "@functions/numberFormat";

import { bot } from "@commands";

import { Message } from "node-telegram-bot-api";

export default async function watch(msg: Message, match: RegExpMatchArray | null) {
  const chatId = msg.chat.id;

  if (!match) {
    await bot.sendMessage(chatId, "Ошибка: ссылка некорректная.");
    return;
  }

  const link = match[1];

  try {
    bot.sendMessage(chatId, "Минуточку, пьем 🍻 и парсим сайтец 🙈")

    const getLink = await Links.get(chatId, link);

    if (!getLink) {
      const [linkInfo] = await Promise.all([
        Links.create(chatId, link)
      ]);

      await bot.sendMessage(chatId, `Теперь я наблюдаю за ${linkInfo.name}\nНачальная цена: ${numberFormat(+linkInfo.price)} золотых монет`);
    } else {
      await bot.sendMessage(chatId, `Ты золотая рыбка? ${getLink.get("name")} уже существует!`);
    }
  } catch (error) {
    await bot.sendMessage(chatId, `⚠️Ошибка! Некорректная ссылка`);
  }
}
