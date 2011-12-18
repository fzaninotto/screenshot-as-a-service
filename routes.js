
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
  res.render('index', { title: 'Express' });
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

/*
 * GET screenshot.
 */

app.get('/:url(*)', ratelimit(60, 10), function(req, res, next){
  var url = utils.url(req.params.url);
  if (!url) return res.send(400);
  var id = utils.md5(url);

  var options = {
      path: join(dir, id + '.png')
    , viewportWidth: 800
    , viewportHeight: 600
  };

  console.log('screenshot - rasterizing %s', url);
  rasterize(url, options, function(err){
    if (err) return next(err);
    console.log('screenshot - rasterized %s', url);
    app.emit('screenshot', url, options.path, id);
    res.sendfile(options.path);
  });
});

