var crypto = require('crypto'),
    fs = require('fs'),
    path = require('path');

/**
 * MD5 the given `str`.
 */

exports.md5 = function(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
};

/**
 * Imply "http://" for `url`.
 */

exports.url = function(url){
  return (url.indexOf('://') >= 0) ? url : 'http://' + url;
};

/**
 * Synchronously delete all files in [dirPath] older than [ttl].  Does not modify subdirectories.
 */

exports.eraseOldFiles = function(dirPath, ttl) {
  ttl = ttl || 0;
  var expireTime = Date.now() - ttl;
  fs.readdirSync(dirPath).forEach(function(file) {
    if (file.indexOf('screenshot_') === 0) {
      try {
        var filePath = path.join(dirPath, file);
        var stats = fs.statSync(filePath);
        if (stats.isFile() && expireTime > stats.mtime.getTime()) {
          console.log('Erasing file: ' + filePath + ' (older than ' + ttl + 'ms)');
          fs.unlinkSync(filePath);
        }  
      } catch(e) {
        if (e.code === 'ENOENT') {
          console.log('Tried erasing file ' + filePath + ' but ENOENT thrown, skipping...');
        } else {
          throw e;
        }
      }
    }
  })
};

/**
 * Delete file asynchronously if it exists.
 */

exports.eraseFile = function(filePath) {
  if (filePath) {
    fs.lstat(filePath, function(err, stats) {
      if (!err && stats.isFile()) {
        fs.unlink(filePath);
      }
    });
  }
};
