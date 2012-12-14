/**
 * Module dependencies.
 */

var knox = require('knox');

/**
 * S3 service.
 *
 * Sends assets to S3
 *
 * @param {Object} Server configuration
 * @api public
 */
var S3Service = function(config) {
  this.config = config;
};

/**
 * Upload an image to S3
 * @param  {Object}   options  The options object.
 * @param  {Object}   res      express res object.
 * @param  {Function} callback  the callback.
 */
S3Service.prototype.send = function(options, res, callback) {
  // check if requested bucket exists
  var bucket;
  if (options.headers.s3bucket in this.config) {
    bucket = this.config[options.headers.s3bucket];
  } else {
    for (var firstBucket in this.config) {
      bucket = this.config[firstBucket];
      break;
    }
  }

  var client = knox.createClient({
    key: bucket.accessKey,
    secret: bucket.secretKey,
    bucket: bucket.bucket
  });

  var savePath = bucket.path + options.headers.filename;
  console.log('Saving to bucket: %s on filepath: %2', bucket.bucket, savePath);
  client.putFile( options.headers.filePath,
    savePath, this.onResponse.bind(this, callback));

};


/**
 * Handle S3 response object
 * @param  {Function} callback The cb.
 * @param  {Object|string} err The error object.
 * @param  {Object} res The res object from knox.
 * @param  {[type]}   req      [description]
 */
S3Service.prototype.onResponse = function(callback, err, res) {
  console.log('putFile response:', err);
  // construct basic response object
  var response = {
    status: false,
    url: null,
    err: null
  };
  if (200 == res.statusCode) {
    // despite what's in the knox docs the newly created S3 asset's
    // url is not in res.url see: https://github.com/LearnBoost/knox/issues/87
    response.url = res.client._httpMessage.url;
    console.log('saved to s3 url:', response.url);
    response.status = true;
    callback(err, response);
  } else {
    console.log('error statusCode:' + res.statusCode);
    response.err = err;
    callback(err, response);
  }
};

module.exports = S3Service;
