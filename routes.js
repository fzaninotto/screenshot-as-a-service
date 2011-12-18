
var rasterize = require('./lib/rasterize')
  , ratelimit = require('./lib/ratelimit')
  , utils = require('./lib/utils')
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

app.get('/', ratelimit(100, 10), function(req, res, next){
  var url = req.query.url;
  if (!url) return res.send(400);
  var id = utils.md5(url);
  var path = join(dir, id + '.png');
  rasterize(url, path, function(err){
    if (err) return next(err);
    app.emit('screenshot', url, path, id);
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
