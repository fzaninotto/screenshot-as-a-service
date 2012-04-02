var rasterize = require('../lib/rasterize');
var utils = require('../lib/utils');
var join = require('path').join;
var fs = require('fs');
var request = require('request');

/*
 * Usage
 */
app.get('/', function(req, res) {
  res.send("\
USAGE:\n\
\n\
# Take a screenshot\n\
GET /www.google.com\n\
# Return a 1024x600 PNG screenshot of the www.google.com homepage\n\
\n\
# Custom viewport size\n\
GET /www.google.com?width=800&height=600\n\
# Return a 800x600 PNG screenshot of the www.google.com homepage\n\
\n\
# Asynchronous call\n\
GET /www.google.com?callback=http://www.myservice.com/screenshot/google\n\
# Return an empty response immediately (HTTP 200 OK),\n\
# then send a POST request to the callback URL when the screenshot is ready\n\
# with the PNG image in the body.\n");
});

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
    var callback = utils.url(req.param('callback'));
    res.send('Will post screenshot of ' + url + ' to ' + callback + ' when processed');
    rasterize(url, options, function(err) {
      console.log('screenshot - streaming to %s', callback);
      var fileStream = fs.createReadStream(options.path);
      fileStream.pipe(request.post(callback, function(err) {
        console.log('Error while streaming screenshot: %s', err.message);
      }));
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