require('dotenv').config();

module.exports = {
  // server
  PORT: process.env.PORT || 3000,

  // jwt
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',

  // db (mongo)
  MONGO_URI: process.env.MONGO_URI,
  DB_PREFIX: process.env.DB_PREFIX || 'app',

  // redis
  REDIS_ENABLE: process.env.REDIS_ENABLE, // 'Y' or 'N'
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_RETRY_BASE_DELAY: process.env.REDIS_RETRY_BASE_DELAY || 50,
  REDIS_RETRY_MAX_DELAY: process.env.REDIS_RETRY_MAX_DELAY || 2000,
};