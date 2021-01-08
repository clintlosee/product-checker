import express from 'express';
import cors from 'cors';

import { uniqueScrapes } from './lib/utils';
import { checkProducts } from './lib/scraper';
import db from './lib/db';
import './lib/cron';

const app = express();
app.use(cors());

async function go() {
  await checkProducts();
}
go();

app.get('/', (_, res) => {
  res.json({ message: 'Nothing to see here... 🙁' });
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

  // uniqueData.forEach(item => {
  //   console.log(new Date(item.date).toLocaleDateString());
  //   console.log(new Date(item.date));
  // });

  //* respond with json
  res.json({ uniqueData, data });
});

app.listen(2012, () => {
  console.log(`App running on port 2012`);
});
