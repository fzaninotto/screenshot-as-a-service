/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;
var request = require('request');

/**
 * Rasterizer service.
 *
 * The service starts, kills or restarts rasterizer server
 *
 * The constructor expects a configuration object as parameter, with these properties:
 *   command: Command to start a phantomjs process
 *   port: Server listerner port
 *   path: Destination of temporary images
 *   viewport: Width and height represent the viewport size (format: '1024x800')
 *
 * @param {Object} Server configuration
 * @api public
 */
var RasterizerService = function(config) {
  this.isStopping = false;
  this.config = config;
  this.rasterizer;
  this.pingDelay = 10000; // every 10 seconds
  this.sleepTime = 30000; // three failed health checks, 30 seconds
  this.lastHealthCheckDate = null;
  var self = this;
  process.on('exit', function() {
    self.isStopping = true;
    self.killService();
  });
}

RasterizerService.prototype.rasterizerExitHandler = function (code) {
  if (this.isStopping) return;
  console.log('phantomjs failed; restarting');
  this.startService();
};

RasterizerService.prototype.startService = function() {
  var rasterizer = spawn(this.config.command, ['scripts/rasterizer.js', this.config.path, this.config.host + ':' + this.config.port, this.config.viewport]);
  rasterizer.stderr.on('data', function (data) {
    console.log('phantomjs error: ' + data);
  });
  rasterizer.stdout.on('data', function (data) {
    console.log('phantomjs output: ' + data);
  });
  rasterizer.on('exit', this.rasterizerExitHandler);
  this.rasterizer = rasterizer;
  this.lastHealthCheckDate = Date.now();
  this.pingServiceIntervalId = setInterval(this.pingService.bind(this), this.pingDelay);
  this.checkHealthIntervalId = setInterval(this.checkHealth.bind(this), 1000);
  console.log('Phantomjs internal server listening on port ' + this.config.port);
  return this;
}

RasterizerService.prototype.killService = function() {
  if (this.rasterizer) {
    // Remove the exit listener to prevent the rasterizer from restarting
    this.rasterizer.removeListener('exit', this.rasterizerExitHandler);
    this.rasterizer.kill();
    clearInterval(this.pingServiceIntervalId);
    clearInterval(this.checkHealthIntervalId);
    console.log('Stopping Phantomjs internal server');
  }
}

RasterizerService.prototype.restartService = function() {
  if (this.rasterizer) {
    this.killService();
    this.startService();
  }
}

RasterizerService.prototype.pingService = function() {
  if (!this.rasterizer) {
    this.lastHealthCheckDate = 0;
  }
  var self = this;
  request('http://localhost:' + this.getPort() + '/healthCheck', function(error, response) {
    if (error || response.statusCode != 200) return;
    self.lastHealthCheckDate = Date.now();
  });
}

RasterizerService.prototype.checkHealth = function() {
  if (Date.now() - this.lastHealthCheckDate > this.sleepTime) {
    console.log('Phantomjs process is sleeping. Restarting.');
    this.restartService();
  }
}

RasterizerService.prototype.getPort = function() {
  return this.config.port;
}

RasterizerService.prototype.getPath = function() {
  return this.config.path;
}

module.exports = RasterizerService;
