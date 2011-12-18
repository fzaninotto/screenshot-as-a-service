
var exec = require('child_process').exec
  , script = app.get('root') + '/scripts/rasterize.js'
  , bin = app.get('phantom');

/**
 * Rasterize the given `url`, saving the
 * image to `path`, and callback `(err, stdout, stderr)`.
 *
 * @param {String} url
 * @param {String} path
 * @param {Function} fn
 */

module.exports = function(url, path, fn){
  var cmd = [bin, script, url, path];
  cmd = cmd.join(' ');
  exec(cmd, fn);
};