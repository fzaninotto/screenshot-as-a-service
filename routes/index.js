var utils = require('../lib/utils');
var join = require('path').join;
var path = require('path');
var request = require('request');

module.exports = function(app, useCors) {
  var rasterizerService = app.settings.rasterizerService;

  app.get('/', function(req, res, next) {
    if (!req.param('url', false)) {
      return res.redirect('/usage.html');
    }
    // set options for request
    var options = {
      uri: 'http://localhost:' + rasterizerService.getPort() + '/',
      headers: { url: utils.url(req.param('url')) }
    };
    // add params to options
    ['outputFormat', 'width', 'height', 'clipRect', 'pdfFormat', 'pdfOrientation', 'pdfMargin', 'pdfFooter', 'javascriptEnabled', 'loadImages', 'localToRemoteUrlAccessEnabled', 'userAgent', 'userName', 'password', 'delay'].forEach(function(name) {
      if (req.param(name, false)) {
        options.headers[name] = req.param(name);
      }
    });
    // add x-headers to options
    var xheaders = {};
    for (var key in req.headers) {
      if (req.headers.hasOwnProperty(key) && /^x[-_]/i.test(key)) {
        xheaders[key] = req.headers[key];
      }
    }
    xheaders['Cookie'] = xheaders['x-cookie'];
    delete xheaders['x-cookie'];
    options.headers.xheaders = JSON.stringify(xheaders);
    // add output filename to options. ddefault output filetype is .png, unless outputFormat param is given
    var filename = 'screenshot_' + utils.md5(options.headers.url + JSON.stringify(options)) +
                   '.' + req.param('outputFormat', 'png').toLowerCase();
    options.headers.filename = filename;
    var dirPath = rasterizerService.getPath();
    var filePath = join(dirPath, filename);
    callRasterizer(options, function(error) {
      if (error) {
        console.log('Erasing file:', filePath);
        utils.eraseFile(filePath);
        next(error);
      } else {
        sendImageInResponse(filePath, res, function(err) {
          if(err) next(err);
        });
      }
    });
  });

  var callRasterizer = function(rasterizerOptions, callback) {
    console.log('Rasterizing request for:', rasterizerOptions.headers.url);
    request.get(rasterizerOptions, function(error, response, body) {
      if (error || response.statusCode < 200 || response.statusCode > 299) {
        console.log('Error while requesting the rasterizer: %s', error.message);
        rasterizerService.restartService();
        return callback(new Error(body));
      } else if (body.indexOf('Error: ') === 0) {
        var errmsg = body.substring(7);
        console.log('Error while requesting the rasterizer: %s', errmsg);
        return callback(new Error(errmsg));
      }
      callback(null);
    });
  };

  var sendImageInResponse = function(filePath, res, callback) {
    console.log('Sending file in response:', filePath);
    if (useCors) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Expose-Headers", "Content-Type");
    }
    res.sendfile(filePath, function(err) {
      console.log('Erasing file:', filePath);
      utils.eraseFile(filePath);
      callback(err);
    });
  }
};
