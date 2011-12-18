
var rasterize = require('./lib/rasterize')
  , crypto = require('crypto')
  , path = require('path')
  , join = path.join
  , fs = require('fs');

var dir = app.get('screenshots')
  , db = app.db;

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

app.get('/', function(req, res, next){
  var url = req.query.url;
  if (!url) return res.send(400);
  var id = md5(url);
  var path = join(dir, id + '.png');
  rasterize(url, path, function(err){
    if (err) return next(err);
    app.emit('screenshot', path, id);
    res.sendfile(path);
  });
});

/**
 * GET stats.
 */

app.get('/stats', function(req, res){
  db.hgetall('screenshot:stats', function(err, obj){
    if (err) return next(err);
    res.send(obj);
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