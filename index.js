require('dotenv').config()
const ircClient = require('node-irc')
const cheerio = require('cheerio')
const axios = require('axios')

const { CHANNEL, USERS, BOT_NAME, HOST, PORT, BOT_NICK, RADIO_LINK } = process.env
var client = new ircClient(HOST, PORT, BOT_NICK, BOT_NAME);

client.on('ready', function () {
  client.join(CHANNEL);
});

client.on('PRIVMSG', function (data) {
  console.log('priv', data)
})

client.on('CHANMSG', function (data) {
  console.log('chan', data)
  if (USERS.includes(data.sender)) {
    if (data.message === '+radio') {
      client.say(CHANNEL, RADIO_LINK);
    }
  }
})
client.connect();