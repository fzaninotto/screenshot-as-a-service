/**
 * Module dependencies.
 */
var fs = require('fs');

/**
 * File cleaner service.
 *
 * The service cleans up files after a certain time.
 * The constructor expects the file lifetime, in milliseconds.
 *
 * @param {int} cache lifetime in microseconds, default to 1 minute.
 *              When set to 0, adding a file causes its deletion at the next tick
 * @api public
 */
var FileCleanerService = function(ttl) {
  this.ttl = typeof ttl === 'undefined' ? 60000 : ttl;
  this.files = {};
  var self = this;
  process.on('exit', function() {
    self.removeAllFiles();
  });
}

FileCleanerService.prototype.addFile = function(path) {
  if (typeof this.files[path] != 'undefined') {
    // do nothing. The file will expire sooner than expected
    return;
  }
  var self = this;
  this.files[path] = setTimeout(function() {
    self.removeFile(path);
  }, this.ttl);
}

FileCleanerService.prototype.removeFile = function(path) {
  if (typeof this.files[path] == 'undefined') {
    throw new Error('File ' + path + 'is not managed by the cleaner service');
  }
  delete this.files[path];
  try {
    fs.unlinkSync(path);
  } catch(e) {
    console.error(e);
  }
}

FileCleanerService.prototype.removeAllFiles = function() {
  for (path in this.files) {
    this.removeFile(path);
  }
}

module.exports = FileCleanerService;
