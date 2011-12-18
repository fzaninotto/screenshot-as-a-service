
var rasterize = require('../lib/rasterize')
  , crypto = require('crypto')
  , path = require('path')
  , join = path.join
  , fs = require('fs');

/**
 * Screenshots directory.
 */

var dir = app.get('screenshots');

/*
 * GET home page.
 */

app.get('/', function(req, res, next){
  if (req.query.url) return next();
  res.render('index', { title: 'Express' });
});

/*
 * GET screenshot.
 */

app.get('/', function(req, res){
  var url = req.query.url;
  if (!url) return res.send(400);
  var id = md5(url);
  var path = join(dir, id + '.png');
  rasterize(url, path, function(err){
    if (err) return res.send(500, 'Something broke!\n');
    app.emit('screenshot', path, id);
    res.sendfile(path);
  });
});

/**
 * Set screenshot:<id> hash.
 */

app.on('screenshot', function(path, id){
  app.db.hmset('screenshot:' + id, {
    path: path,
    id: id
  });
});

/**
 * MD5 the given `str`.
 */

function md5(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
}