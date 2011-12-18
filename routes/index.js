
var rasterize = require('../lib/rasterize')
  , fs = require('fs');

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
  var path = '/tmp/out.png';
  rasterize(url, path, function(err){
    if (err) return res.send(500, 'Something broke!\n');
    res.sendfile(path);
  });
});

