require('dotenv').config();

module.exports = {
  // server
  app:{
    NAME: process.env.APP_NAME || 'TaskDrobe',
    PORT: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',

  },
  

  // jwt
  jwt: {
 JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',
  },
 

  // db (postgres)
  database:{
  DB_PREFIX: process.env.DB_PREFIX || 'TSDB',
  DB_HOST     : process.env.DB_HOST,
  DB_PORT    : process.env.DB_PORT,
  DB_NAME : process.env.DB_NAME ,
  DB_USER  : process.env.DB_USER,
  DB_PWD  : process.env.DB_PWD,
  },

  // redis
  redis:{
  REDIS_ENABLE: process.env.REDIS_ENABLE, // 'Y' or 'N'
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_RETRY_BASE_DELAY: process.env.REDIS_RETRY_BASE_DELAY || 50,
  REDIS_RETRY_MAX_DELAY: process.env.REDIS_RETRY_MAX_DELAY || 2000,
  }
 
};