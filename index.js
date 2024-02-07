require('dotenv').config()
const ircClient = require('node-irc')
var irc = require('irc')
const axios = require('axios')
const NodeCache = require( "node-cache" );
const myCache = new NodeCache()

const { CHANNEL, USERS, BOT_NAME, HOST, PORT, BOT_NICK, RADIO_LINK, IG_LINK, API, TEMAS, PASSWORD } = process.env
const params = [HOST, PORT, BOT_NICK, BOT_NAME]
// PASSWORD && params.push(PASSWORD)
// console.log(params)
var client = new ircClient(...params);
var client = new irc.Client(HOST, BOT_NICK, {
  channels: [CHANNEL],
  userName: BOT_NICK,
  password: PASSWORD,
  realName: BOT_NAME,
});

let speak = false
let start = new Date()
setTimeout(() => {
  speak = true
}, 1000 * 200)

const say = (channel, message) => {
  if(!speak) {
    const now = new Date()
    console.log(`w8 ${200 - ((now - start)/1000)} seconds more`)
    return
  }
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
    if (message.includes('+insta')) {
      say(CHANNEL, IG_LINK);
    }
    if (message.includes('+ig')) {
      say(CHANNEL, IG_LINK);
    }
    if (message === '+temas') {
      console.log(message)
      myCache.set('scream', true)
      setTimeout(() => {
        myCache.set('scream', false)
      }, 1000 * 60 * parseInt(TEMAS))
    }
  }
});
setInterval(() => {
  console.log(1)
  axios.post(API)
  .then(res => {
      console.log(2)
      const prev = myCache.get("current")
      console.log(prev, res.data.title, myCache.get('scream'), prev !== res.data.title)
      if (prev !== res.data.title && myCache.get('scream')) {
        say(CHANNEL, `${res.data.title} (8)`);
        success = myCache.set("current", res.data.title);
      }
    })
}, 10000)