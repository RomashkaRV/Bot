import Links from "@services/links";
import { bot } from "@commands";
import { Message } from "node-telegram-bot-api";

function numberToEmoji(number: number) {
  const emojiDigits = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
  return number.toString().split("").map(digit => emojiDigits[parseInt(digit)]).join("");
}

export default async function list(msg: Message) {
  const chatId = msg.chat.id;

  const list = await Links.list(chatId);

  const text = list.map((item, index) => `${numberToEmoji(index + 1)} [${item.get("name")}](${item.get("link")})`);

  const buttons = list.map((item, index) => ({
    text: numberToEmoji(index + 1),
    callback_data: `/info ${item.get("id")}`
  }));

  return bot.sendMessage(
    chatId,
    `*Информация о всех отслеживаемых ссылках*\n\n${text.join("\n\n")}`,
    {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [...buttons]
        ]
      }
    }
  );
}
