import axios from 'axios';
import cheerio from 'cheerio';
import db from './db';
import {
  sendEmail,
  emailBodySetup,
  uniqueScrapes,
  runStockCheck,
} from './utils';
import urls from '../data/urls';

require('dotenv').config();

export async function emailAlert(data) {
  //* Look at the data and determine email sending.
  try {
    const uniqueData = uniqueScrapes(data);
    const noProductsEmailText = `Sorry, no products were found in stock. Check again later.`;

    //* Filter for any in stock product
    // const inStockProducts = uniqueData.filter(product =>
    //   product.inStock ||
    //   (product.checkStoresOpt && product.stockCheck.inStock.length > 0)
    //     ? product
    //     : false
    // );

    //* Filter for any in stock in UT product
    const inStockProductsUT = uniqueData.filter(product =>
      product.inStock ||
      (product.checkStoresOpt && product.stockCheck.inStockUT.length > 0)
        ? product
        : false
    );

    //* Send email if there are any stock products
    // if (inStockProducts.length > 0) {
    //* Send email if there are in stock products in UT
    if (inStockProductsUT.length > 0) {
      const emailText = inStockProductsUT
        .map(product => emailBodySetup(product))
        .join('');

      await sendEmail(`Product(s) In Stock`, emailText);
    } else {
      await sendEmail(`No Products In Stock In UT`, noProductsEmailText);
    }
  } catch (error) {
    console.log('ERROR!!!!', error);
    await sendEmail('Product Checker Error', error.message);
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
  // console.log('productName:', productName);

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

  const checkStoresOpt = $(
    '.check-nearby-stores a.js-pickup-in-store-button'
  ).html();
  // console.log('checkStoresOpt:', checkStoresOpt);

  let stockCheck = null;
  // const stockCheck = checkStoresOpt ? await runStockCheck(productURL, productName) : null;
  if (checkStoresOpt) {
    stockCheck = await runStockCheck(productURL);
  }
  // console.log('stockCheck:', productName, stockCheck);

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
    // checkStoresOpt: checkStoresOpt ? checkStoresOpt.trim() : false,
    checkStoresOpt: !!checkStoresOpt,
    stockCheck,
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

  emailAlert(result); //* turn on for emails to be sent
  console.log('✅ DONE!');
}
