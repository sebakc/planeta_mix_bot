require('dotenv').config()
var irc = require('irc')
const axios = require('axios')
const NodeCache = require( "node-cache" )
const myCache = new NodeCache()
const fs = require('fs')
const request = require('request')
const OpenAI = require('openai')
const telegram = require('./telegram')
const audioTransformer = require('./audio-transformer')
let speak = false
let start = new Date()
let temasTimeout, temasInterval

const {
  CHANNELS,
  USERS,
  BOT_NAME,
  HOST,
  BOT_NICK,
  RADIO_LINK,
  IG_LINK,
  API,
  TEMAS,
  PASSWORD,
  START_TIMEOUT,
  TELEGRAM_CHAT_ID,
  OPENAI_API_KEY
} = process.env
let CHANNELS2 = CHANNELS.split(',')
const CHANNEL = CHANNELS2[0]
const openai = new OpenAI({apiKey: OPENAI_API_KEY});

const TIMEOUT = 5 || START_TIMEOUT
var client = new irc.Client(HOST, BOT_NICK, {
  channels: CHANNELS2,
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

let command = ''

telegram.on('message', async (msg) => {
  // const chatId = msg.chat.id;
  // console.log(chatId)
  const { text } = msg
  const args = text?.split('$') || []
  if (text === '!clear') command = ''
  if (args[0] === 'set') {
    command = args[1]
    return
  }
  if(!args) return
  if (msg.voice?.file_id) {
    await telegram.getFileLink(msg.voice.file_id)
    .then(async fileUri => {
      // The path where you want to save the downloaded file
      const filePath = 'original_audio.ogg';
      
      // Download the file using the 'request' library
      await request.get(fileUri)
        .on('error', function(err) {
          console.log(err);
        })
        .pipe(fs.createWriteStream(filePath))
        .on('close', async () => {
          console.log('File downloaded successfully');
          await audioTransformer(filePath, 'final_audio.wav')
          const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream("final_audio.wav"),
            model: "whisper-1",
            language: "es",
          })
          if (command.length) {
            say(command, transcription.text)
          }
          console.log('File transformed successfully');
        })
    })
    .catch(error => {
      console.log('An error occurred:', error);
    })
  }
  if (command.length) {
    say(command, args[0])
  }
  if (args[0] === 'chan') {
    const [ channel, message ] = args[1].split(/ (.*)/s)
    say(`#${channel}`, message)
  }
  if (args[0] === 'msg') {
    const [ user, message ] = args[1].split(/ (.*)/s)
    say(user, message)
  }
});

client.addListener('pm', function (from, message) {
  telegram.sendMessage(TELEGRAM_CHAT_ID, `${from}: ${message}`);
  if (USERS.toLowerCase().includes(from.toLowerCase())) {
    const args = message?.split('#')
    if(!args) return
    // if (message.includes('!msg#')) {
    //   const [ user, sayit ] = args[1].split(/ (.*)/s)
    //   say(user, sayit)
    // }
    if (message.includes('!chan#')) {
      const [ channel, sayit ] = args[1].split(/ (.*)/s)
      say(`#${channel}`, sayit)
    }
    if ('!aiura'.includes(message)) {
      say(from, '!chan#elcanal el mensaje que quieres mandar. Ej: !chan#planeta_mix el seba es un ser de luz')
      say(from, '+temas. Para que el bot diga que cancion esta sonando, dura 2 horas')
      say(from, '+temas down. Para que el bot deje de decir que cancion esta sonando')
      say(from, '+ig. Para que muestre el instagram')
      say(from, '+insta. Para que muestre el instagram')
      say(from, '+radio. Para que muestre la radio')
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
