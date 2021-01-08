import cron from 'node-cron';
import { runCron } from './scraper';

//* To run every minute
cron.schedule('* * * * *', () => {
  //* To run every 30 min
  // cron.schedule('0,30 * * * *', () => {
  console.log('⏲️  RUNNING THE CRON');
  runCron();
});
