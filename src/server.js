import express from 'express';
import exitHook from 'async-exit-hook';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from '~/config/environment';
import { APIs_V1 } from '~/routes/v1';

const START_SERVER = () => {
  const app = express();

  app.use('/v1', APIs_V1);

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}`);
  });

  exitHook(() => {
    console.log('Closing DB...');
    CLOSE_DB();
    console.log('Closed DB successfully');
  });
};

(async () => {
  try {
    console.log('Connecting to DB...');
    await CONNECT_DB();
    console.log('Connected to DB successfully');
    START_SERVER();
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();
