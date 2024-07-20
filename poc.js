const Scrapper = require('./src/lib/scrapper')

const scrapper = new Scrapper()

const fetch = `Es uno de los más disciplinados del zodiaco y lo aplica a todo lo que rodea su vida. Es un signo de tierra, dominado por Saturno que le hace ser constructor y reflexivo. Normalmente es muy realista y alcanza el éxito por su tesón. Demasiado introspectivo, le cuesta expresar sus emociones y sus sentimientos y nadie penetra en su intimidad. Tiene un alto sentido del deber.`

const app = async () => {
  await scrapper.fetch('https://www.20minutos.es/horoscopo/capricornio')
  scrapper.smartSelector(fetch)
}
app()