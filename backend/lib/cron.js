import cron from 'node-cron';
import { runCron } from './scraper';

//* Cron schedules
// const everyMinute = '* * * * *';
// const everyThreeMinutes = '*/3 * * * *';
// const everyThirtyMinutes = '0,30 * * * *';
// const everyThirtyBetweenFiveAndTen = '*/30 05-22 * * *';
const everyHourBetweenSixAndTen = '00 06-22 * * *';

//* To run every minute
cron.schedule(everyHourBetweenSixAndTen, () => {
  console.log('⏲️  RUNNING THE CRON');
  runCron();
});
