const axios = require('axios')
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const NodeCache = require( "node-cache" );
const { get } = require('http');
const cache = new NodeCache()

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
  const today = getToday()
  const signData = cache.get(sign)
  if(signData && signData.date !== today) {
    cache.del(sign)
  }
  if(signData && signData.date === today) {
    return formatPrediction(signData, sign)
  }
  const data = await axios.get(`${API}/${sign}`)
  .then(res => {
    return res.data
  })
  
  const dom = new JSDOM(data);
  const document = dom.window.document;
  let prediction = {
    range: null,
    rangedPrediction: null,
    date: null,
    prediction: null
  }
  document.querySelectorAll(`.prediction.${sign}`).forEach((el, i) => {
    prediction.range = el.querySelectorAll('p')[0].textContent
    prediction.rangedPrediction = el.querySelectorAll('p')[1].textContent
  })
  document.querySelectorAll(`.prediction`).forEach((el, i) => {
    prediction.date = el.querySelector('p').textContent
    prediction.prediction = el.querySelector('div').textContent
  })
  cache.set(sign, {...prediction, date: today})
  cache.set('today', getToday())
  return formatPrediction(prediction, sign)
}

module.exports = getHoroscopo