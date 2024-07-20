const Bot = require('./src/Bot');
const envConfig = require('./src/envConfig');
const app = new Bot({
  CHANNELS: envConfig.CHANNELS,
  ADMIN: envConfig.ADMIN,
  USERS: envConfig.USERS,
  BOT_NICK: envConfig.BOT_NICK,
  BOT_NAME: envConfig.BOT_NAME,
  PASSWORD: envConfig.PASSWORD,
  HOST: envConfig.HOST,
});

// app.commands.subscribe((command) => {
// });
// 
// this.say(from, "!chan#elcanal el mensaje que quieres mandar. Ej: !chan#planeta_mix el seba es un ser de luz");
// this.say(from, "+temas. Para que el bot diga que cancion esta sonando, dura 2 horas");
// this.say(from, "+temas down. Para que el bot deje de decir que cancion esta sonando");
// this.say(from, "+ig. Para que muestre el instagram");
// this.say(from, "+insta. Para que muestre el instagram");
// this.say(from, "+radio. Para que muestre la radio");

app.init();