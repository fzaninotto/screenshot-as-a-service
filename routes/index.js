var utils = require('../lib/utils');
var join = require('path').join;
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;

module.exports = function(app) {

  var rasterizerService = app.settings.rasterizerService;
  var cache = rasterizerService.getCache();
  var useCaching = cache.active;

  app.get('/', function(req, res, next) {
    if (!req.param('url', false)) {
      return res.redirect('/usage.html');
    }
    var url = utils.url(req.param('url'));

    // required options
    var options = {
      uri: 'http://localhost:' + rasterizerService.getPort() + '/',
      headers: { url: url }
    };
    ['width', 'height', 'clipRect', 'javascriptEnabled', 'loadImages', 'localToRemoteUrlAccessEnabled', 'userAgent', 'userName', 'password'].forEach(function(name) {
      if (req.param(name, false)) options.headers[name] = req.param(name);
    });

    var id = 'saas_' + utils.md5(url) + "_" + utils.md5(JSON.stringify(options));
    var filename = id + '.png';
    var filepath = join(rasterizerService.getPath(), filename);

    options.headers.filename = filename;


    if (useCaching) {
      if (fs.existsSync(filepath)) {
          res.sendfile(filepath, function(err) {
            if (err) {
              res.statusCode = 500;
              res.end('Error getting screenshot');
            }
          });
          return;
      }
    }

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
        var fileStream = fs.createReadStream(filepath);
        fileStream.on('end', function() {
          if (!useCaching) {
            fs.unlink(filepath);
          }
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
      request.get(options, function(error, response, body) {
        if (error || response.statusCode != 200) {
          return next(new Error(body));
        }

        console.log('screenshot - sending response ', filepath);

        res.sendfile(filepath, function(err) {
          if (!useCaching) {
            fs.unlink(filepath);
          }
          if (err) {
            res.statusCode = 500;
            res.end('Error getting screenshot');
          }
        });
      });
    }
  });

  app.get('*', function(req, res, next) {
    // for backwards compatibility, try redirecting to the main route if the request looks like /www.google.com
    res.redirect('/?url=' + req.url.substring(1));
  });


  if (useCaching && cache.cleanup) {
    console.log("Initializing cache cleanup", "Interval: ", cache.cleanupInterval);
    cacheCleanup(cache);
  }
};


function cacheCleanup(cache) {

  var dir = cache.path;
  var maxAge = cache.maxAge;
  var now = new Date().getTime();

  try {

    // Get all files for possible cleanup, and sort them oldest first.
    var files = fs.readdirSync(dir).filter(function(name) {
      return !!name.match(/^saas_.*\.png/);
    }).map(function(v) {
      return {
        name: v,
        time: fs.statSync(dir + v).mtime.getTime()
      };
    }).sort(function(a, b) { return a.time - b.time; });

    // Remove all files that are too old or that are over the max number allowed.
    for (var i = 0; i < files.length; i++) {

      var tooOld = now - files[i].time > maxAge;
      var tooMany = files.length - i > cache.maxItems;

      if (tooOld || tooMany) {
        fs.unlinkSync(dir + files[i].name);
      }
      else {
        break;
      }
    }
  }
  catch(e) {
    console.log("Error in cache cleanup", e);
  }

  setTimeout(cacheCleanup, Math.max(10, cache.cleanupInterval), cache);
}