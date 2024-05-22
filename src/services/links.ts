import { bot } from "@commands";
import LinkInfoModel from "@models/link.info.model";
import LinkModel from "@models/link.model";
import ParseService from "@services/parse";
import numberFormat from "@functions/numberFormat";

export default class Links {

  static async get(chatId: number, link: string) {
    return LinkModel.findOne({
      where: {
        link,
        chatId: chatId.toString()
      }
    });
  }

  static async list(chatId: number) {
    return LinkModel.findAll({
      where: {
        chatId: chatId.toString()
      },
      include: [{
        model: LinkInfoModel,
        as: "info"
      }],
      order: [
        [
          {
            model: LinkInfoModel,
            as: "info"
          }, 'id', 'ASC'
        ]
      ],
    });
  }

  static async create(chatId: number, link: string) {
    const { name, price, image } = await ParseService.getInfo(link);

    if (!name || !price || price === "Price not available") {
      throw new Error("Некорректная ссылка или данные недоступны.");
    }

    const linkModel = await LinkModel.create({
      chatId: chatId.toString(),
      link,
      name,
      image
    });

    await LinkInfoModel.create({
      price: +price,
      linkId: linkModel.id
    });

    return {
      name,
      price,
      image
    };
  }

  static async remove(chatId: number, id: number) {
    try {
      const link = await LinkModel.findOne({
        where: {
          id,
          chatId: chatId.toString()
        }
      });

      if (!link) {
        throw new Error("Ссылка не найдена или не пренадлежит этому чату");
      }

      await LinkModel.destroy({
        cascade: true,
        where: {
          id
        }
      });

      return `Ссылка с ID ${id} была удалена.`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  }

  static async checkPrices() {
    const list = await LinkModel.findAll({
      include: [{
        model: LinkInfoModel,
        as: "info"
      }],
      order: [
        [
          {
            model: LinkInfoModel,
            as: "info"
          }, 'id', 'ASC'
        ]
      ],
    });

    await Promise.all(
      list.map(async (item) => {
        const { price } = await ParseService.getInfo(item.get("link"));

        const info = item.get("info");

        const lastPrice = info[info.length - 1].get("price");

        if (lastPrice === +price) {
          return;
        }

        const newPrice = numberFormat(+price);
        const oldPrice = numberFormat(lastPrice);

        const priceIsUp = newPrice > oldPrice;

        await Promise.all([
          bot.sendMessage(
            item.get("chatId"),
            `🔥 *${item.get("name")}* _(ID - ${item.get("id")})_ 🔥\n\nЦена *${priceIsUp ? "повысилась" : "понизилась"}*\n_Старая цена:_ ${oldPrice} рублей\n*Новая цена:* ${newPrice} рублей`,
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Подробнее",
                      callback_data: `/info ${item.get("id")}`
                    }
                  ]
                ]
              }
            }
          ),
          LinkInfoModel.create({
            price: +price,
            linkId: item.get("id")
          })
        ]);
      })
    );
  }
}
