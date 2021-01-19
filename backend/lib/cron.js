import cron from 'node-cron';
import { runCron } from './scraper';

//* Cron schedules
// const everyMinute = '* * * * *';
// const everyThirtyMinutes = '0,30 * * * *';
// const everyThirtyBetweenFiveAndTen = '*/30 05-22 * * *';
const onePastHourBetweenFiveAndTen = '01 05-22 * * *';

//* To run every minute
cron.schedule(onePastHourBetweenFiveAndTen, () => {
  console.log('⏲️  RUNNING THE CRON');
  runCron();
});
