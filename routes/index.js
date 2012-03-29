var rasterize = require('../lib/rasterize');
var utils = require('../lib/utils');
var join = require('path').join;
var fs = require('fs');

/*
 * GET screenshot.
 */
app.get('/:url(*)', function(req, res, next){
  var url = utils.url(req.params.url);
  if (!url) return res.send(400);

  var id = utils.md5(url);

  var options = {
  	command: config.browser.command,
  	options: config.browser.options,
    path: join(config.screenshot.directory, id + '.png'),
    viewportWidth: req.query.width || config.browser.viewport.width,
    viewportHeight: req.query.height || config.browser.viewport.height
  };

  console.log('screenshot - rasterizing %s %dx%d', url, options.viewportWidth, options.viewportHeight);

  rasterize(url, options, function(err){
    if (err) return next(err);
    console.log('screenshot - rasterized %s', url);
    app.emit('screenshot', url, options.path, id);
    res.sendfile(options.path, function(err) {
      fs.unlink(options.path);
    });
  });
});
