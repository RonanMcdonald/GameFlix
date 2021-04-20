var request = require('request')
var handlebar = require('handlebars')
var fs = require('fs')
const { count } = require('console')

// Splash
exports.renderPhase_1 = (req, res) => {
  res.render('index')
}

// Account
exports.renderPhase_2 = (req, res) => {
  res.render('login')
}
exports.renderPhase_2_1 = (req, res) => {
  res.render('signup')
}
exports.renderPhase_2_2 = (req, res) => {
  res.render('editprof')
}

// Dashboard
exports.renderPhase_3 = async function (req, res) {
  await main().then((data) => {
    console.log('Sucess')
    res.render('dashboard', { layout: false, demo: data })
  })
}

async function api_request(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(url, (err, response, body) => {
        if (!err && response.statusCode < 400) {
          resolve(JSON.parse(body))
        }
      })
    }, 25)
  })
}

// main()
async function main() {
  console.log('Calling API. May take up to 30 seconds')
  return await api_request('https://steam-store-api.herokuapp.com/')
}
