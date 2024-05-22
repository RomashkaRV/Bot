import axios from "axios";
import cheerio from "cheerio";

export default class ParseService {

  static async getInfo(link: string) {
    try {
      const content = await axios.get(link);
      const $ = cheerio.load(content.data);

      const name = $('h1.title_card_product:first').text();

      const priceText = $(
        'p.price_title_product:first').text()
        .replace("—", "")
        .replace(/\s/g, '')
        .replace("Р", '');

      let price: number | string = "Price not available";

      if (priceText) {
        const numericPrice = parseFloat(priceText.replace(",", "."));
        if (!isNaN(numericPrice) && numericPrice > 0) {
          price = numericPrice;
        }
      }

      const image = $('.slick-current:first').find('img').attr('src');

      return {
        name,
        price,
        image
      };
    } catch (error) {
      throw new Error(`Ошибка: ${error}`);
    }
  }
}
