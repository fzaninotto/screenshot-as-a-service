var utils = require('../lib/utils');
var join = require('path').join;
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;

module.exports = function(app) {
  /*
   * Usage
   */
  app.get('/', function(req, res) {
    res.send("\
<html><body><pre>\n\
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
# with the PNG image in the body.\n\
</pre></body>\n");
  });

  /*
   * GET screenshot.
   */
  app.get('/:url', function(req, res, next) {
    if (req.param('url') == 'favicon.ico') return next();
    var url = utils.url(req.param('url'));
    if (!url) return res.send(400);
    var id = utils.md5(url + Date.now());
    var filename = id + '.png';
    var rasterizerService = app.settings.rasterizerService;
    var path = join(rasterizerService.getPath(), filename);
    // required options
    var options = {
      uri: 'http://localhost:' + rasterizerService.getPort() + '/',
      headers: { url: url, filename: filename }
    };
    ['width', 'height', 'clipRect', 'javascriptEnabled', 'loadImages', 'localToRemoteUrlAccessEnabled', 'userAgent', 'userName', 'password'].forEach(function(name) {
      if (req.param(name, false)) options.headers[name] = req.param(name);
    });

    console.log('screenshot - rasterizing %s', url);

    if (req.param('callback', false)) {
      // asynchronous
      var callback = utils.url(req.param('callback'));
      res.send('Will post screenshot of ' + url + ' to ' + callback + ' when processed');
      request.get(options, function(err) {
        // FIXME: call the callback with an error
        if (err) {
          console.log(err.message);
          rasterizerService.restartService();
          return;
        }
        console.log('screenshot - streaming to %s', callback);
        var fileStream = fs.createReadStream(path);
        fileStream.on('end', function() {
          fs.unlink(path);
        });
        fileStream.on('error', function(err){
          console.log('Error handled in file reader: %s', err.message);
        });
        fileStream.pipe(request.post(callback, function(err) {
          if (err) console.log('Error while streaming screenshot: %s', err);
        }));
      });
    } else {
      // synchronous
      request.get(options, function(err) {
        if (err) return next(err);
        console.log('screenshot - sending response');
        res.sendfile(path, function(err) {
          fs.unlink(path);
        });
      });
    }
  });
};