var rasterize = require('../lib/rasterize');
var utils = require('../lib/utils');
var join = require('path').join;
var fs = require('fs');
var request = require('request');

/*
 * GET screenshot.
 */
app.get('/:url(*)', function(req, res, next){
  var url = utils.url(req.param('url'));
  if (!url) return res.send(400);

  var id = utils.md5(url + Date.now());

  var options = {
    command:        config.browser.command,
    path:           join(config.tmpdir, id + '.png'),
    viewportWidth:  req.param('width', config.browser.viewport.width),
    viewportHeight: req.param('height', config.browser.viewport.height)
  };

  console.log('screenshot - rasterizing %s %dx%d', url, options.viewportWidth, options.viewportHeight);

  if (req.param('callback', false)) {
    // asynchronous
    var callback = req.param('callback');
    res.send('Will post screenshot of ' + url + ' to ' + callback + ' when processed');
    rasterize(url, options, function(err) {
      console.log('screenshot - streaming to ' + callback);
      var fileStream = fs.createReadStream(options.path);
      fileStream.pipe(request.post(callback));
      fileStream.on('end', function() {
        fs.unlink(options.path);
      });
    });
  } else {
    // synchronous
    rasterize(url, options, function(err) {
      if (err) return next(err);
      console.log('screenshot - sending response');
      res.sendfile(options.path, function(err) {
        fs.unlink(options.path);
      });
    });
  }
});