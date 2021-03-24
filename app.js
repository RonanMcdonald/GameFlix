const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
var connectLiveReload = require('connect-livereload');

var publicDirectory = __dirname + '/public';

// Front-End LiveReload.
// var livereload = require("livereload")
// var liveReloadServer = livereload.createServer()
// liveReloadServer.watch(publicDirectory)
// liveReloadServer.server.once("connection", () => {
//     setTimeout(() => {
//         liveReloadServer.refresh("/")
//     }, 10);
// })

app.use(express.urlencoded({ extended: true }));

const mustache = require('mustache-express');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');

app.set('views', __dirname + '/public/views');
app.use(express.static(publicDirectory));

// app.use(connectLiveReload())

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader('Content-Type', 'text/html');
  next();
});

const routes = require('./routes/route.js');
app.use('/', routes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  //console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
