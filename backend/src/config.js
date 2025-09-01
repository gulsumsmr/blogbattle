require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/blog_battle',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  VOTE_LIMIT: parseInt(process.env.VOTE_LIMIT) || 10
};
