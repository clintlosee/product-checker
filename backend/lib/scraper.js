import axios from 'axios';
import cheerio from 'cheerio';
import db from './db';
import { sendEmail, uniqueScrapes } from './utils';
import urls from '../data/urls';

require('dotenv').config();

function emailBodySetup(product) {
  return `<div>
  <p>======================</p>
  <p>${product.productName} is possibly in stock at price: ${product.priceString}</p>
  <p>URL: <a href="${product.productURL}">${product.productURL}</a></p>
  <p>Check to see if stores nearby have it!</p>
  </div>`;
}

export async function emailAlert(data) {
  //* Look at the data and determine email sending.
  try {
    const uniqueData = uniqueScrapes(data);

    const inStockProducts = uniqueData.filter(product =>
      product.inStock ? product : false
    );

    //* Send email if there are in stock products
    if (inStockProducts.length > 0) {
      const emailText = inStockProducts
        .map(product => emailBodySetup(product))
        .join('');

      await sendEmail(`Product(s) Possibly In Stock`, emailText);
    }
  } catch (error) {
    console.log('ERROR!!!!', error);
    // await sendEmail('Product Checker Error', error.message);
    throw error;
  }
}

export async function getHTML(url) {
  const { data: html } = await axios.get(url);
  return html;
}

export async function checkStock(html) {
  const $ = cheerio.load(html);

  const productURL = $('link[rel="canonical"]')
    .attr('href')
    .trim();
  // console.log('productURL:', productURL);

  const productName = $('h1.name')
    .text()
    .trim();

  $('.product-details__id span').remove();
  const productID = $('.product-details__id')
    .text()
    .trim();
  // console.log('productID:', productID);

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
    productURL,
    productID,
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

  emailAlert(result);
  console.log('✅ DONE!');
}
