import axios from 'axios';
import cheerio from 'cheerio';
import db from './db';

require('dotenv').config();

const urls = [
  'https://www.sportsmans.com/shooting-gear-gun-supplies/ammunition-ammo-for-hunting-shooting-sports/rifle-ammo-hunting-shooting-sports/fiocchi-training-dynamics-300-aac-blackout-150gr-fmjbt-rifle-ammo-50-rounds/p/1656667',
  'https://www.sportsmans.com/shooting-gear-gun-supplies/gun-cases-locks/rifle-cases/gunmate-deluxe-40in-rifle-case-black/p/1215322',
];

export async function getHTML(url) {
  const { data: html } = await axios.get(url);
  return html;
}

export async function checkStock(html) {
  const $ = cheerio.load(html);

  const productName = $('h1.name')
    .text()
    .trim();

  const soldOutBtn = $('.smw-item-not-available')
    .text()
    .trim();
  // console.log('soldOutBtn:', soldOutBtn);

  const inStockBtn = $('#addToCartButton')
    .text()
    .trim();
  // console.log('inStockBtn:', inStockBtn);

  $('p.price span').remove();
  const priceString = $('.product-details__price-block p.price')
    .text()
    .trim();
  // console.log('priceString:', priceString);

  const priceNumber = parseFloat(priceString.replace('$', ''));
  // console.log('priceNumber:', priceNumber);

  return {
    date: Date.now(),
    productName,
    soldOutBtn,
    soldOut: soldOutBtn.length !== 0,
    inStockBtn,
    inStock: inStockBtn.length !== 0,
    priceString: priceString.trim(),
    priceNumber,
  };
}

export async function getData(url) {
  const html = await getHTML(url);
  const check = await checkStock(html);
  return check;
}

export async function checkProducts() {
  const data = await Promise.all(urls.map(async url => getData(url)));
  return data;
}

export async function runCron() {
  const result = await checkProducts();
  result.forEach(item => {
    db.get('data')
      .push(item)
      .write();
  });
  console.log('DONE!');
}
