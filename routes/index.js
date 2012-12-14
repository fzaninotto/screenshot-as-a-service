var utils = require('../lib/utils');
var join = require('path').join;
var fs = require('fs');
var path = require('path');
var request = require('request');

module.exports = function(app) {
  var rasterizerService = app.settings.rasterizerService;
  var fileCleanerService = app.settings.fileCleanerService;
  var s3Service = app.settings.s3Service;

  // routes
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

    // define the GET vars that we will parse
    var allowedGETvars = ['width', 'height', 'clipRect', 'javascriptEnabled', 'loadImages',
      'localToRemoteUrlAccessEnabled', 'userAgent', 'userName', 'password', 'callback',
      'delay', 's3', 's3bucket'];

    allowedGETvars.forEach(function(name) {
      if (req.param(name, false)) options.headers[name] = req.param(name);
    });

    var filename = 'screenshot_' + utils.md5(url + JSON.stringify(options)) + '.png';
    options.headers.filename = filename;
    options.headers.filePath = join(rasterizerService.getPath(), filename);
    options.headers.callbackUrl = options.headers.callback ? utils.url(options.headers.callback) : false;

    processImage(res, options,
      function(err) { if (err) next(err); });

  });

  app.get('*', function(req, res, next) {
    // for backwards compatibility, try redirecting to the main route if the request looks like /www.google.com
    res.redirect('/?url=' + req.url.substring(1));
  });

  // bits of logic
  var processImage = function(res, options, callback) {
    options.headers.callbackUrl = options.headers.callbackUrl;

    // define the method to be used after rasterizer service finishes
    // or generally the screenshot asset is ready to be served
    // by default we send the image as a response back to the client
    var method = sendImageInResponse;

    // check if reply is with a url callback
    if (options.headers.callbackUrl) {
      // asynchronous
      res.send('Will post screenshot to ' + options.headers.callbackUrl + ' when processed');
      method = postImageToUrl;
    }

    // check if we'll save the screenshot to a S3 bucket
    if (options.headers.s3) {
      // upload asset to s3
      method = postImagetoS3;
    }

    // check if file is already there
    if (path.existsSync(options.headers.filePath)) {
      console.log('Request for %s - Found in cache', options.headers.url);
      method(options, res, callback);
      return;
    }

    console.log('Request for %s - Rasterizing it', options.headers.url);

    callRasterizer(options, function(error) {
        if (error) return callback(error);
        method(options, res, callback);
    });


  };

  var callRasterizer = function(rasterizerOptions, callback) {
    request.get(rasterizerOptions, function(error, response, body) {
      if (error || response.statusCode != 200) {
        console.log('Error while requesting the rasterizer: %s', error.message);
        rasterizerService.restartService();
        return callback(new Error(body));
      }
      callback(null);
    });
  };

  var postImagetoS3 = function(options, res, callback){
    console.log('Uploading image to S3');
    s3Service.send(options, res, function(err, s3Obj) {
      fileCleanerService.addFile(options.headers.filePath);
      res.send(s3Obj);
      callback(err);
    });
  };

  var postImageToUrl = function(options, res, callback) {
    console.log('Streaming image to %s', options.headers.callbackUrl);
    var fileStream = fs.createReadStream(options.headers.filePath);
    fileStream.on('end', function() {
      fileCleanerService.addFile(options.headers.filePath);
    });
    fileStream.on('error', function(err){
      console.log('Error while reading file: %s', err.message);
      callback(err);
    });
    fileStream.pipe(request.post(options.headers.callbackUrl, function(err) {
      if (err) console.log('Error while streaming screenshot: %s', err);
      callback(err);
    }));
  };

  var sendImageInResponse = function(options, res, callback) {
    console.log('Sending image in response');
    res.sendfile(options.headers.filePath, function(err) {
      fileCleanerService.addFile(options.headers.filePath);
      callback(err);
    });
  };

};