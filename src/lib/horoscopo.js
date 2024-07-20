const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const NodeCache = require( "node-cache" );
const cache = new NodeCache();
const Scrapper = require('./Scrapper')

function getToday() {
  let today = new Date()
  return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
}

cache.set('today', getToday())
const API = 'https://www.20minutos.es/horoscopo/'

const formatPrediction = (prediction, sign) => {
  return [
    sign.toUpperCase()+' '+prediction.range+': '+prediction.rangedPrediction,
    sign.toUpperCase()+' HOY: '+prediction.prediction
  ]
}

const getHoroscopo = async (sign) => {
  sign = sign.toLowerCase()
  const validSigns = ['aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo', 'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis']
  if (!sign || !validSigns.includes(sign)) {
    throw new Error('Por favor, introduce un signo válido. Ejemplo: /horoscopo aries')
  }
  const today = getToday()
  const signData = cache.get(sign)
  if(signData && signData.date !== today) {
    cache.del(sign)
  }
  if(signData && signData.date === today) {
    return formatPrediction(signData, sign)
  }

  let prediction = {
    range: null,
    rangedPrediction: null,
    date: null,
    prediction: null
  }

  const scrapper = new Scrapper()
  await scrapper.fetch(`${API}/${sign}`)
  scrapper
    .querySelectorAll(`.prediction.${sign}`).forEach((el) => {
      prediction.range = el.querySelectorAll('p')[0].textContent
      prediction.rangedPrediction = el.querySelectorAll('p')[1].textContent
    })
    .querySelectorAll(`.prediction`).forEach((el, i) => {
      prediction.date = el.querySelector('p').textContent
      prediction.prediction = el.querySelector('div').textContent
    })
  cache.set(sign, {...prediction, date: today})
  cache.set('today', getToday())
  return formatPrediction(prediction, sign)
}

module.exports = getHoroscopo