require('dotenv').config()
module.exports = {
  ADMIN: process.env.ADMIN,
  CHANNELS: process.env.CHANNELS,
  USERS: process.env.USERS,
  BOT_NAME: process.env.BOT_NAME,
  HOST: process.env.HOST,
  BOT_NICK: process.env.BOT_NICK,
  RADIO_LINK: process.env.RADIO_LINK,
  IG_LINK: process.env.IG_LINK,
  API: process.env.API,
  TEMAS: process.env.TEMAS,
  PASSWORD: process.env.PASSWORD,
  START_TIMEOUT: process.env.START_TIMEOUT,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  BOT_OPENAI_API_KEY: process.env.BOT_OPENAI_API_KEY,
}