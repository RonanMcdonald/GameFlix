const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
var connectLiveReload = require('connect-livereload')

var publicDirectory = __dirname + '/public'

// Front-End LiveReload.
var livereload = require('livereload')
var liveReloadServer = livereload.createServer()
liveReloadServer.watch(publicDirectory)
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/')
  }, 8)
})
app.use(connectLiveReload())

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', 'public/views')

var exphbs = require('express-handlebars')
app.engine(
  '.hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: '/public/views/layouts',
    partialsDir: 'server/views/partials',
  })
)
app.set('view engine', '.hbs')

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.setHeader('Content-Type', 'text/html')
  next()
})

const routes = require('./routes/route.js')
app.use('/', routes)

const PORT = 8090
app.listen(PORT, function () {
  //console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
})
