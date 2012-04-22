/**
 * Module dependencies.
 */
var config = require('config');
var spawn = require('child_process').spawn;
var express = require('express');

// rasterizer
var rastconfig = config.rasterizer;
var rasterizer = spawn(rastconfig.command, ['scripts/rasterizer.js', rastconfig.path, rastconfig.port, rastconfig.viewport]);
console.log('Phantomjs internal server listening on port ' + rastconfig.port);
process.on('exit', function() {
  console.log('Stopping Phantomjs internal server');
  rasterizer.kill();
});
process.on('SIGINT', function () {
  process.exit();
});

// web service
var app = express.createServer();
app.configure(function(){
  app.use(app.router);
  app.use(express.static(__dirname + '/public'))
  app.set('rasterizerPath', rastconfig.path);
  app.set('rasterizerPort', rastconfig.port);
});
app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
require('./routes')(app);
app.listen(config.server.port);
console.log('Express server listening on port ' + config.server.port);
