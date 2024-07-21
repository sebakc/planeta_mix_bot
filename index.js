const Bot = require('./src/Bot');
const envConfig = require('./src/envConfig');
const Temas = require('./src/lib/Temas');
const getHoroscopo = require('./src/lib/horoscopo');
const app = new Bot({
  CHANNELS: envConfig.CHANNELS,
  ADMIN: envConfig.ADMIN,
  USERS: envConfig.USERS,
  BOT_NICK: envConfig.BOT_NICK,
  BOT_NAME: envConfig.BOT_NAME,
  PASSWORD: envConfig.PASSWORD,
  HOST: envConfig.HOST,
});
const temas = new Temas(app);
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const instagram = app.commands.echo({
  message: envConfig.IG_LINK,
  name: 'instagram',
  description: 'Muestra el link instagram',
  command: '+ig',
  aliases: ['+insta']
});

const radio = app.commands.echo({
  message: envConfig.RADIO_LINK,
  name: 'radio',
  description: 'Muestra link de la radio',
  command: '+radio',
  aliases: []
});

const temasUp = app.commands.custom({
  name: 'temas',
  description: 'Muestra temas que estan sonando',
  command: '+temas',
  aliases: [],
  callback: () => {
    temas.up();
  }
});

const temasDown = app.commands.custom({
  name: 'stop temas',
  description: 'Deja de mostrar temas que estan sonando',
  command: '+stoptemas',
  aliases: ['+stop'],
  callback: ({ app }) => {
    app.say(app.CHANNEL, 'Deteniendo temas...');
    temas.down();
  }
});

const horoscopo = app.commands.custom({
  name: 'horoscopo',
  description: 'Muestra el horoscopo',
  command: '+horoscopo',
  aliases: ['+horo'],
  callback: ({ app, message }) => {

    const signs = ['aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo', 'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis'];
    const sign = message.split(" ")[1];
    if(message.split(" ").length < 2 && !signs.includes(sign)) {
      app.say(app.CHANNEL, "Por favor, introduce un signo válido. Ejemplo: +horoscopo aries. Para ver lista de signos usa +horoscopo list");
      return
    }
    if(sign === "list") {
      app.say(app.CHANNEL, "Lista de signos: aries, tauro, geminis, cancer, leo, virgo, libra, escorpio, sagitario, capricornio, acuario, piscis");
      return
    }
    getHoroscopo(sign)
      .then(res => {
        res.forEach(r => {
          app.say(app.CHANNEL, r);
        });
      }).catch(err => {
        app.say(app.CHANNEL, err.message);
        app.say(app.CHANNEL, "Lista de signos: aries, tauro, geminis, cancer, leo, virgo, libra, escorpio, sagitario, capricornio, acuario, piscis");
      });
  }

});

app.commands.add(instagram);
app.commands.add(radio);
app.commands.add(temasUp);
app.commands.add(temasDown);
app.commands.add(horoscopo);

// this.say(from, "+temas down. Para que el bot deje de decir que cancion esta sonando");

app.init();