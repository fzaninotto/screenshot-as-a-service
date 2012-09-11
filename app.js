/**
 * Module dependencies.
 */
var config = require('config');
var express = require('express');
var exists = require('fs').exists || require('path').exists;
var RasterizerService = require('./lib/rasterizerService');
var FileCleanerService = require('./lib/fileCleanerService');

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
var app = express.createServer();
app.configure(function(){
  app.use(express.static(__dirname + '/public'))
  app.use(app.router);
  app.set('rasterizerService', new RasterizerService(config.rasterizer).startService());
  app.set('fileCleanerService', new FileCleanerService(config.cache.lifetime));
});
app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
require('./routes')(app);

// load plugins
exists('./plugins/index.js', function(flag) {
  if (flag) {
    require('./plugins').init(app, config);
  };
});

app.listen(config.server.port);
console.log('Express server listening on port ' + config.server.port);