const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    // eslint-disable-next-line no-console
    console.log(`[db] connected to MongoDB at ${env.MONGODB_URI}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] MongoDB connection error:', err.message);
    // Do not crash the whole process in dev if DB is unavailable at boot;
    // routes that need DB will error per-request. In production you may
    // want to exit instead. We keep the server up so a sanity boot-check
    // (no DB required) can still succeed.
  }
}

module.exports = connectDB;
