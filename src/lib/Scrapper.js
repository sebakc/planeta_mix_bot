const axios = require('axios');
const envConfig = require('../envConfig');
const fs = require('fs');
const OpenAI = require("openai");
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const NodeCache = require( "node-cache" );
const { env } = require('process');
const cache = new NodeCache();

class Scrapper {
  constructor() {
    this.JSDOM = JSDOM;
    this.dom = null;
    this.document = null;
    this.elements = null;
    this.openai = null;
  }
  async fetch(url) {
    return await axios.get(url)
      .then(res => {
        this.data = res.data
        this.dom = new this.JSDOM(this.data);
        this.document = this.dom.window.document;
        return this
      }).catch(err => {
        console.error('error fetching data: ', err)
        return this
      })
  }
  querySelector(selector) {
    this.value = this.document.querySelector(selector)
    return this
  }
  querySelectorAll(selector) {
    this.value = this.document.querySelectorAll(selector)
    return this
  }
  forEach(callback) {
    this.value.forEach(callback)
    return this
  }
  puppeteerFetch() {
    // fetch data with puppeteer and return the document
    // used when axios is not enough, for example when the site is rendered with javascript
  }
  async smartSelector(text) {
    // delete all scripts tags from this.document.body then return the rest of the html
    const clean = this.document.body.cloneNode(true)
    Array.from(clean.querySelectorAll('script')).map(script => script.remove())
    if(envConfig.BOT_OPENAI_API_KEY && !this.openai) {
      this.openai = new OpenAI({ apiKey: envConfig.BOT_OPENAI_API_KEY });
    }
    if(this.openai) {
      const chatCompletion = await this.openai.chat.completions.create({
        messages: [
          { role: 'user', content: `find the best selector to find the container of the text "${text}" from the page: ${clean.outerHTML}. Expected Result: .prediction.sign .container p. exclude any explanation, return just the classes` },
        ],
        model: 'gpt-4',
      }).then((response) => {
        fs.writeFileSync('response.json', JSON.stringify(response, null, 2))
        console.log(response.choices[0].message.content)
        return response.choices[0].message.content
      })
    }
  }
}

module.exports = Scrapper;