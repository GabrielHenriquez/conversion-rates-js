
//VARIABLES
const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')


//FUNCTIONS
const getUrl = currency => `https://v6.exchangerate-api.com/v6/e7ad243290645e75689eff72/latest/${currency}`

const state = (() => {
  let exchangeRate = {}

  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if(!newExchangeRate.conversion_rates){
        alert('O objeto precisa ter uma propriedade conversion_rates')
        return
      }

      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

const getErrorMessage = (errorType) => ({
  'unsupported-code': 'A moeda não existe em nosso banco de dados.',
  'base-code-only-on-pro': 'Informações que não sejam USD ou EUR só podem ser acessadas no plano PRO.',
  'invalid-key': 'A chave da API não é válida.',
  'not-available-on-plain': 'Seu plano atual não permite este tipo de request.',
  'malformed-request': 'O endpoint do seu request precisa seguir a estrutura à seguir https://v6.exchangerate-api.com/v6/e7ad243290645e75689eff72/latest/USD'
})[errorType] || 'Não foi possível obter as informações.'

const fetchExchangeRate = async url => {
  try{
    const response = await fetch(url)

    if(!response.ok){
      throw new Error('Sua conexão falhou. Não foi possível obter as informações.')
    }

    const exchangeRateData = await response.json()
  
    if(exchangeRateData.result === 'error'){
      const errorMessage = getErrorMessage(getErrorMessage(exchangeRateData['error-type']))
      throw new Error(errorMessage)
    }

    return state.setExchangeRate(exchangeRateData)
  }catch(err){ 
     alert(err)
  }
}
const getOptions = (selectedCurrency, conversion_rates) => {
  const setSelectedAtribute = currency => currency === selectedCurrency ? 'selected' : ''

  return Object.keys(conversion_rates)
  .map(currency => `<option ${setSelectedAtribute(currency)} >${currency}</option>`)
  .join('')
}
const getMultipliedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return (timesCurrencyOneEl.value * currencyTwo).toFixed(2)
}

const getNotRoundedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} = ${1 * currencyTwo} ${currencyOneEl.value}`
}

const showUpdatedRates = ({conversion_rates}) => {
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
  valuePrecisionEl.textContent = getNotRoundedExchangeRate(conversion_rates)
}

const showInitialInfo = ({conversion_rates}) => {
  currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)

  showUpdatedRates({conversion_rates})
}

const init = async () => {
  const url = getUrl('USD')
  const exchangeRate = await fetchExchangeRate(url)
 
  if(exchangeRate && exchangeRate.conversion_rates){
    showInitialInfo(exchangeRate)
  }
}


//EVENTS
timesCurrencyOneEl.addEventListener('input', (e) => {
  const {conversion_rates} = state.getExchangeRate()
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
})
 
currencyTwoEl.addEventListener('input', () => {
  const exchangeRate = state.getExchangeRate()
  showUpdatedRates(exchangeRate)
})

currencyOneEl.addEventListener('input', async (e) => {
  const url = getUrl(e.target.value)
  const exchangeRate = await fetchExchangeRate(url)
  
  showUpdatedRates(exchangeRate)
})


//START 
init()


