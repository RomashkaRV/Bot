import axios from 'axios';
import * as cheerio from 'cheerio';

export default class ParseService {
  static async getInfo(link: string): Promise<{ name: string; price: string; image: string | undefined }> {
    try {
      const { data } = await axios.get(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        // proxy: {
        //   host: '47.91.65.23',
        //   port: 3128
        // }
      });

      if (!data) {
        throw new Error('Нет данных в ссылке!');
      }

      const $ = cheerio.load(data);

      // Проверяем структуру HTML и обновляем селекторы
      const name = $('h1.title_card_product:first').text().trim();
      const price = $('p.price_title_product:first').text()
        .replace('—', '')
        .replace(/\s/g, '')
        .replace('Р', '').trim();

      const image = $('.product-images-slider__main-img:first').attr('src');

      // Логирование результатов для отладки
      console.log('Parsed name:', name);
      console.log('Parsed price:', price);
      console.log('Parsed image:', image);

      if (!name || !price) {
        throw new Error('Не удалось проанализировать необходимые поля.');
      }

      return {
        name,
        price,
        image,
      };
    } catch (error) {
      console.error('Parser Error:', error);
      throw new Error(`Ошибка парсера: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}
