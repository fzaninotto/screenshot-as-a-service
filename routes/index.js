
var rasterize = require('../lib/rasterize');

/*
 * GET home page.
 */

exports.index = function(req, res, next){
  if (req.query.url) return next();
  res.render('index', { title: 'Express' });
};

/*
 * GET screenshot.
 */

exports.screenshot = function(req, res){
  var url = req.query.url;
  if (!url) return res.send(400);
  
};

