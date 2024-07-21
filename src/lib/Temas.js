const axios = require('axios');
const envConfig = require("../envConfig");
class Temas {
  constructor(app) {
    this.speak = false;
    this.app = app;
    this.current = null;
    this.temasInterval = null;
    this.temasTimeout = null;
  }
  up() {
    this.speak = true;
    this.temasInterval = this.temas();
    this.temasTimeout = setTimeout(() => {
      this.app.say(this.app.CHANNEL, "temas off");
      this.speak = false;
      clearInterval(this.temasInterval);
    }, 1000 * 60 * parseInt(envConfig.TEMAS));
  }
  temas() {
    const tell = () => {
      axios.post(envConfig.API)
        .then(res => {
          if (this.current !== res.data.title && this.speak) {
            this.app.say(this.app.CHANNEL, `${res.data.title} 🎶`);
            this.current = res.data.title;
          }
        });
    }
    tell();
    return setInterval(() => {
      tell();
    }, 1000 * 10);
  }
  down() {
    this.current = null;
    clearInterval(this.temasInterval);
    clearTimeout(this.temasTimeout);
    this.speak = false;
  }
}
module.exports = Temas;