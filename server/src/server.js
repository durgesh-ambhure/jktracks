const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

start();
