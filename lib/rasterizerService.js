/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;

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
  if (this.rasterizer) {
    this.rasterizer.kill();
    console.log('Stopping Phantomjs internal server');
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