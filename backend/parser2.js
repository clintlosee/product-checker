require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// https://smile.amazon.com/dp/B07H289S79/

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const nightmare = require("nightmare")()
// const rp = require("request-promise")
const axios = require('axios');
const cheerio = require('cheerio');

// const args = process.argv.slice(2);
// const url = args[0];
// const minPrice = args[1];

function sendEmail(subject, body) {
  const email = {
    to: process.env.EMAIL,
    from: 'amazon-price-checker@example.com',
    subject,
    text: body,
    html: body,
  };

  return sgMail.send(email);
}

// async function fetchHTML(url) {
//   console.log('url', url);
//   const { data } = await axios.get(url);
//   // console.log('data', data);
//   return cheerio.load(data);
// }

async function getHTML(url) {
  const { data: html } = await axios.get(url);
  // axios
  //   .get(url)
  //   .then(res => {
  //     console.log('res:', res);
  //     return res;
  //   })
  //   .catch(err => {
  //     console.log('ERROR', err);
  //   });
  // console.log('html:', html);
  return html;
}

async function checkPrice(url, minPrice) {
  // console.log(url);
  // console.log(minPrice);
  try {
    const html = await getHTML(url);
    console.log('html:', html);
    // console.log('H1', $('h1').text());

    // const priceString = $('span[id="priceblock_ourprice"]')
    //   .text()
    //   .trim();
    // const priceNumber = parseFloat(priceString.replace('$', ''));
    // console.log(priceString);
    // console.log(priceNumber);

    //* Cheerio/Request-Response method
    // const response = await rp({
    //   uri: url,
    //   headers: {
    //     Accept:
    //       'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    //     'Accept-Encoding': 'gzip, deflate, br',
    //     'Accept-Language':
    //       'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
    //     'Cache-Control': 'max-age=0',
    //     Connection: 'keep-alive',
    //     Host: 'smile.amazon.com',
    //     'Upgrade-Insecure-Requests': '1',
    //     'User-Agent':
    //       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
    //   },
    //   gzip: true,
    // });
    // const $ = cheerio.load(response);
    // const priceString = $('span[id="priceblock_ourprice"]')
    //   .text()
    //   .trim();
    // // const priceNumber = parseFloat(priceString.replace('$', ''));

    // //* Nightmare method
    // const priceString = await nightmare
    //   .goto(url)
    //   .wait('#priceblock_ourprice')
    //   .evaluate(() => document.getElementById('priceblock_ourprice').innerText)
    //   .end();

    // const priceNumber = parseFloat(priceString.replace('$', ''));

    // if (priceNumber < minPrice) {
    //   // await sendEmail(
    //   //   'Price Is Low',
    //   //   `The price on ${url} has dropped below $${minPrice}`
    //   // );
    //   console.log(`It is cheap: ${priceNumber}`);
    // } else {
    //   console.log(`Still not cheap: ${priceNumber}`);
    // }
  } catch (error) {
    console.log('error!!!!!:', error);
    //   // await sendEmail('Amazon Price Checker Error', error.message);
    throw error;
  }
}

// checkPrice();
// checkPrice('https://smile.amazon.com/dp/B07H289S79/', 50);
// checkPrice('https://news.ycombinator.com', 50);
checkPrice(
  'https://www.sportsmans.com/shooting-gear-gun-supplies/ammunition-ammo-for-hunting-shooting-sports/rifle-ammo-hunting-shooting-sports/fiocchi-training-dynamics-300-aac-blackout-150gr-fmjbt-rifle-ammo-50-rounds/p/1656667',
  50
);
// checkPrice('https://example.com', 50);
