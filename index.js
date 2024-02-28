require('dotenv').config()
var irc = require('irc')
const axios = require('axios')
const NodeCache = require( "node-cache" )
const myCache = new NodeCache()
const fs = require('fs')
const telegram = require('./telegram')
let speak = false
let start = new Date()
let temasTimeout, temasInterval

const {
  CHANNEL,
  USERS,
  BOT_NAME,
  HOST,
  PORT,
  BOT_NICK,
  RADIO_LINK,
  IG_LINK,
  API,
  TEMAS,
  PASSWORD,
  START_TIMEOUT,
} = process.env

const TIMEOUT = 5 || START_TIMEOUT
var client = new irc.Client(HOST, BOT_NICK, {
  channels: [CHANNEL],
  userName: BOT_NICK,
  password: PASSWORD,
  realName: BOT_NAME,
})

const say = (channel, message) => {
  if(!speak) {
    const now = new Date()
    console.log(`w8 ${TIMEOUT - ((now - start)/1000)} seconds more`)
    return
  }
  try {
    client.say(channel, message)
  } catch (error) {
    console.log(error)
  }
}

// time to w8 to speak in the room
setTimeout(() => {
  speak = true
  say(CHANNEL, 'bot online')
  say(CHANNEL, '!op')
}, 1000 * TIMEOUT)

const temas = (sec = 10) => {
  const tell = () => {
    axios.post(API)
      .then(res => {
        const prev = myCache.get("current")
        if (prev !== res.data.title && myCache.get('scream')) {
          say(CHANNEL, `${res.data.title} (8)`);
          success = myCache.set("current", res.data.title)
        }
      })
  }
  tell()
  setInterval(() => {
    tell()
  }, 1000 * sec)
}

write = (file, line) => {
  fs.writeFileSync(file, line)
}

telegram.on('message', (msg) => {
  const chatId = msg.chat.id;
  const { text } = msg
  const args = text.split('#')
  if (text.includes('chan#')) {
    const [ channel, message ] = args[1].split(/ (.*)/s)
    say(`#${channel}`, message)
  }
  if (text.includes('msg#')) {
    const [ user, message ] = args[1].split(/ (.*)/s)
    say(user, message)
  }
});

client.addListener('pm', function (from, message) {
  telegram.sendMessage(1477994016, `${from}: ${message}`);
  if (USERS.includes(from)) {
    if (message.includes('!say#')) {
      const [ command, sayit ] = message.split(/ (.*)/s)
      const channel = command.replace('!say', '')
      say(channel, sayit)
    }
  }
})

const actions = (message) => {
  if (message === '+radio') {
    say(CHANNEL, RADIO_LINK);
  }
  if (message === '+insta') {
    say(CHANNEL, IG_LINK);
  }
  if (message === '+ig') {
    say(CHANNEL, IG_LINK);
  }
  if (message === '+temas') {
    myCache.set('scream', true)
    temasInterval = temas()
    temasTimeout = setTimeout(() => {
      say(CHANNEL, 'temas off')
      myCache.set('scream', false)
      clearInterval(temasInterval)
    }, 1000 * 60 * parseInt(TEMAS))
  }
  if (message === '+temas down') {
    myCache.set("current", '')
    clearInterval(temasInterval)
    clearTimeout(temasTimeout)
    myCache.set('scream', false)
  }
}
client.addListener(`message${CHANNEL}`, function (from, message) {
  actions(message)
})

client.addListener('error', function(message) {
  console.log('error: ', message);
});