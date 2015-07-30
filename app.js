/**
 * Module dependencies.
 */
var config = require('config');
var express = require('express');
var RasterizerService = require('./lib/rasterizerService');

process.on('uncaughtException', function (err) {
  console.error("[uncaughtException]", err);
  process.exit(1);
});

process.on('SIGTERM', function () {
  process.exit(0);
});

process.on('SIGINT', function () {
  process.exit(0);
});

// web service
var env = process.env.NODE_ENV || 'development';
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(app.router);
app.set('rasterizerService', new RasterizerService(config.rasterizer).startService());
if ('development' == env) {
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
} else {
  app.use(function errorHandler(err, req, res, next) {
    res.status(500).send();
  });
}
require('./routes')(app, config.server.useCors);
app.listen(config.server.port, config.server.host);
console.log('Express server listening on ' + config.server.host + ':' + config.server.port);
