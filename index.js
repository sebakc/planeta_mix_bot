require('dotenv').config()
const ircClient = require('node-irc')
var irc = require('irc')
const axios = require('axios')
const NodeCache = require( "node-cache" );
const myCache = new NodeCache()

const { CHANNEL, USERS, BOT_NAME, HOST, PORT, BOT_NICK, RADIO_LINK, API, TEMAS, PASSWORD } = process.env
const params = [HOST, PORT, BOT_NICK, BOT_NAME]
// PASSWORD && params.push(PASSWORD)
// console.log(params)
var client = new ircClient(...params);
var client = new irc.Client(HOST, BOT_NICK, {
  channels: [CHANNEL],
  userName: BOT_NICK,
  password: PASSWORD,
  realName: BOT_NAME,
  autoRejoin: true,
  autoConnect: true,
  floodProtection: true
});

const say = (channel, message) => {
  try {
    client.say(channel, message)
  } catch (error) {
    console.log(error)
  }
}

client.addListener(`message${CHANNEL}`, function (from, message) {
  if (USERS.includes(from)) {
    if (message.includes('+radio')) {
      say(CHANNEL, RADIO_LINK);
    }
    if (message === '+temas') {
      myCache.set('scream', true)
      setTimeout(() => {
        myCache.set('scream', false)
      }, 1000 * 60 * parseInt(TEMAS))
    }
  }
});
setInterval(() => {
  axios.post(API)
    .then(res => {
      const prev = myCache.get("current")
      if (prev !== res.data.title && myCache.get('scream')) {
        say(CHANNEL, `${res.data.title} 🎶`);
        success = myCache.set("current", res.data.title);
      }
    })
}, 10000)