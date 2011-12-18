
var exec = require('child_process').exec
  , script = app.get('root') + '/scripts/rasterize.js'
  , bin = app.get('phantom');

/**
 * Rasterize the given `url` and callback `(err, stdout, stderr)`.
 *
 * Options:
 *
 *   - `path`: output file path
 *   - viewportWidth: viewport width
 *   - viewportHeight: viewport height
 *
 * @param {String} url
 * @param {String} path
 * @param {Function} fn
 */

module.exports = function(url, options, fn){
  var cmd = [bin, script, url];
  cmd.push(options.path);
  cmd.push(options.viewportWidth + 'x' + options.viewportHeight);
  cmd = cmd.join(' ');
  exec(cmd, fn);
};