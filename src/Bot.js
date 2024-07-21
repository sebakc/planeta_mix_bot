const irc = require("irc");
const NodeCache = require("node-cache");
const fs = require("fs");
const request = require("request");
const OpenAI = require("openai");
const telegram = require("./lib/telegram");
const audioTransformer = require("./lib/audio-transformer");
const envConfig = require("./envConfig");
const Commands = require("./lib/Commands");
class Bot {
  constructor({
    CHANNELS,
    ADMIN,
    USERS,
    BOT_NICK,
    BOT_NAME,
    PASSWORD,
    HOST,
  }) {
    this.CHANNELS = CHANNELS.split(",");
    this.ADMIN = ADMIN
    this.USERS = USERS
    this.BOT_NICK = BOT_NICK
    this.BOT_NAME = BOT_NAME
    this.PASSWORD = PASSWORD
    this.HOST = HOST

    this.speak = false;
    this.start = new Date();
    this.temasTimeout = null;
    this.temasInterval = null;
    this.command = "";

    this.TIMEOUT = envConfig.START_TIMEOUT || 5;
    this.CHANNEL = this.CHANNELS[0];
    this.botCache = new NodeCache();
    this.commands = new Commands(this);
  }

  init() {
    try {
      this.client = new irc.Client(this.HOST, this.BOT_NICK, {
        channels: this.CHANNELS,
        userName: this.BOT_NICK,
        //password: this.PASSWORD,
        realName: this.BOT_NAME,
      });
      console.log("Bot connected");
    } catch (error) {
      console.error("Error connecting bot: ", error);
    }
    if(envConfig.BOT_OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: envConfig.BOT_OPENAI_API_KEY });
      console.log("OpenAI connected");
    } else {
      console.log("OpenAI not connected");
    }
    this.setupListeners();
    this.setSpeakTimeout();
    if (envConfig.TELEGRAM_CHAT_ID) {
      this.setupTelegramListener();
      console.log("Telegram connected");
    } else {
      console.log("Telegram not connected");
    }
  }

  setupListeners() {
    this.client.addListener("pm", (from, message) => this.handlePrivateMessage(from, message));
    this.client.addListener(`message${this.CHANNEL}`, (from, message) => this.handleChannelMessage(message));
    this.client.addListener("error", message => console.log("error: ", message));
    this.client.addListener("reconnect", message => {
      console.log("reconnect: ", message);
      this.init();
    });
  }

  setSpeakTimeout() {
    setTimeout(() => {
      this.speak = true;
      this.say(this.CHANNEL, "Bot online");
    }, 1000 * this.TIMEOUT);
  }

  setupTelegramListener() {
    telegram.on("message", async (msg) => this.handleTelegramMessage(msg));
  }

  handlePrivateMessage(from, message) {
    if (envConfig.TELEGRAM_CHAT_ID) {
      telegram.sendMessage(envConfig.TELEGRAM_CHAT_ID, `${from}: ${message}`);
    }
    if (envConfig.USERS.toLowerCase().includes(from.toLowerCase())) {
      const args = message?.split("#");
      if (!args) return;
      if (message.includes("!chan#")) {
        const [channel, sayit] = args[1].split(/ (.*)/s);
        this.say(`#${channel}`, sayit);
      }
      if ("!aiura".includes(message)) {
        this.say(from, "!chan#elcanal el mensaje que quieres mandar. Ej: !chan#planeta_mix el seba es un ser de luz");
        this.say(from, "+temas. Para que el bot diga que cancion esta sonando, dura 2 horas");
        this.say(from, "+temas down. Para que el bot deje de decir que cancion esta sonando");
        this.say(from, "+ig. Para que muestre el instagram");
        this.say(from, "+insta. Para que muestre el instagram");
        this.say(from, "+radio. Para que muestre la radio");
      }
    }
  }

  handleChannelMessage(message) {
    this.performActions(message);
  }

  async handleTelegramMessage(msg) {
    const { text } = msg;
    const args = text?.split("$") || [];
    if (text === "!clear") this.command = "";
    if (args[0] === "set") {
      this.command = args[1];
      return;
    }
    if (!args) return;
    if (msg.voice?.file_id) {
      await telegram.getFileLink(msg.voice.file_id)
        .then(async fileUri => {
          const filePath = "original_audio.ogg";
          await request.get(fileUri)
            .on("error", function (err) {
              console.log(err);
            })
            .pipe(fs.createWriteStream(filePath))
            .on("close", async () => {
              console.log("File downloaded successfully");
              await audioTransformer(filePath, "final_audio.wav");
              const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream("final_audio.wav"),
                model: "whisper-1",
                language: "es",
              });
              if (this.command.length) {
                this.say(this.command, transcription.text);
              }
              console.log("File transformed successfully");
            });
        })
        .catch(error => {
          console.log("An error occurred:", error);
        });
    }
    if (this.command.length) {
      this.say(this.command, args[0]);
    }
    if (args[0] === "chan") {
      const [channel, message] = args[1].split(/ (.*)/s);
      this.say(`#${channel}`, message);
    }
    if (args[0] === "msg") {
      const [user, message] = args[1].split(/ (.*)/s);
      this.say(user, message);
    }
  }

  say(channel, message) {
    if (!this.speak) {
      const now = new Date();
      console.log(`w8 ${this.TIMEOUT - ((now - this.start) / 1000)} seconds more`);
      return;
    }
    try {
      this.client.say(channel, message);
    } catch (error) {
      console.log(error);
    }
  }

  async performActions(message) {
    // get all from split except the first element
    const split = message.split(" ");
    const params = split.slice(1);
    for (const {action, command, aliases} of this.commands.commands) {
      if (command == split[0] || aliases.includes(split[0])) {
        await action({ params, message });
        break;
      }
    }
    return
    if (message === "+temas down") {
      this.botCache.set("current", "");
      clearInterval(this.temasInterval);
      clearTimeout(this.temasTimeout);
      this.botCache.set("scream", false);
    }
  }
}

module.exports = Bot;
