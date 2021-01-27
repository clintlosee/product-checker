import express from 'express';
import cors from 'cors';

import { uniqueScrapes } from './lib/utils';
import { checkProducts } from './lib/scraper';
import db from './lib/db';
import './lib/cron'; //* turn on for cron jobs

const port = process.env.PORT || 8080;

process.setMaxListeners(0);

const app = express();
app.use(cors());

//* Don't need to run check at startup
// async function go() {
//   await checkProducts();
// }
// go();

app.get('/', (_, res) => {
  res.json({ message: 'Working, but nothing to see here... 🙁' });
});

app.get('/scrape', async (_, res, next) => {
  console.log('Scraping!!');
  const result = await checkProducts();

  //* Don't save to db here. Only returns live count
  // result.forEach(item => {
  //   db.get('data')
  //     .push(item)
  //     .write();
  // });

  res.json(result);
});

app.get('/data', async (req, res, next) => {
  //* get the scrape data from db
  const { data } = db.value();
  const uniqueData = uniqueScrapes(data);

  //* respond with json
  res.json({ uniqueData, data });
});

app.get('/check-stores', async (req, res, next) => {
  //* get the scrape data from db
  const { data } = db.value();
  const uniqueData = uniqueScrapes(data);

  //* testing out stock checker
  // const url =
  //   'https://www.sportsmans.com/shooting-gear-gun-supplies/ammunition-ammo-for-hunting-shooting-sports/rifle-ammo-hunting-shooting-sports/sig-sauer-elite-performance-300-aac-blackout-125gr-fmj-rifle-ammo-20-rounds/p/1653080';
  // const inStock = await run(url);
  // console.log('inStock route:', inStock);

  //* respond with json
  res.json({ uniqueData });
});

app.post('/add-url', (req, res, next) => {
  console.log('reqQuery:', req.query);
  res.status(201).send({ message: 'All Good', query: req.query });
});

app.get('/reset-db', (req, res, next) => {
  console.log(`⚠️  CLEANING DB DATA!!`);
  db.set('data', []).write();
  console.log('✅ DONE!');

  return res.status(200).json({ message: 'DB DATA CLEANED' });
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
