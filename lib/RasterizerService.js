/**
 * Rasterizer service
 *
 * Start, Kill or Restart rasterizer server
 */

var spawn = require('child_process').spawn;

// Instentiate the RasterizerService
var RasterizerService = function(config) {
  
  this.config = config;
  this.rasterizer;

  process.on('exit', function() {
    this.killService();
  });
}

RasterizerService.prototype.startService = function() {
  this.rasterizer = spawn(this.config.command, ['scripts/rasterizer.js', this.config.path, this.config.port, this.config.viewport]);
  console.log('Phantomjs internal server listening on port ' + this.config.port);
}

RasterizerService.prototype.killService = function() {
  console.log('Stopping Phantomjs internal server');
  if (this.rasterizer) {
    this.rasterizer.kill();
  }
}

RasterizerService.prototype.restartService = function() {
  if (this.rasterizer) {
    this.killService();
    this.startService();
  }
}

RasterizerService.prototype.getPort = function() {
  return this.config.port;
}

RasterizerService.prototype.getPath = function() {
  return this.config.path;
}

module.exports = RasterizerService;