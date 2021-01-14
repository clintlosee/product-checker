import sgMail from '@sendgrid/mail';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export function uniqueScrapes(data) {
  //* filter for unique productIDs
  const uniqueIDs = [...new Set(data.map(item => item.productID))];

  //* return most recent item
  const uniqueData = uniqueIDs.map(
    id =>
      data
        .filter(obj => obj.productID === id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  );

  return uniqueData;
}

export function sendEmail(subject, body) {
  const email = {
    to: process.env.EMAIL,
    from: 'product-checker@example.com',
    subject,
    text: body,
    html: body,
  };

  return sgMail.send(email);
}

export async function runStockCheck(url) {
  console.log('✅ STARTING STOCK CHECK...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url);

  const checkNearbyStores =
    'div.smw-delivery-mode-item-label.smw-nongrid-only > span.check-nearby-stores a';

  await page.click(checkNearbyStores);

  // await page.waitForTimeout(5 * 1000);
  // await page.waitForSelector('.closest-store-indicator');
  await page.waitForSelector('.pickup-store-container');

  // const storeLength = await page.evaluate(
  //   sel =>
  //     // console.log('sel:', sel);
  //     // return sel
  //     document.querySelectorAll(sel).length,
  //   pickupList
  // );
  // console.log('storeLength:', storeLength);

  const HTML = await page.content();

  const $ = cheerio.load(HTML);
  const storeDiv = $(`.store-availability-div`).text();

  const storeStockList = [];
  if (storeDiv.length > 0) {
    $(`.store-availability-div`).each((i, e) => {
      storeStockList[i] = $(e)
        .text()
        .replace('stockIn', 'stock in');
    });
  } else {
    $(`.store-availability`).each((i, e) => {
      $('.pickup-store-container').remove();
      const parent = $(e).siblings();
      const text = `${$(e).text()} - ${parent
        .text()
        .replace(` | free shipping, no transfer fees `, '')}`;

      storeStockList[i] = text;
    });
  }

  const filteredStores = storeStockList.filter(item => item.includes('UT'));

  const inStock = storeStockList.filter(store => store.includes('in stock'));
  const inStockUT = filteredStores.filter(store =>
    store.includes('pick up in')
  );

  console.log('❌ ENDING STOCK CHECK');

  return {
    inStock,
    inStockUT,
  };
}
