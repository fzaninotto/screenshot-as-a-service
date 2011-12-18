
var Canvas = require('canvas')
  , palette = require('palette')
  , Image = Canvas.Image
  , fs = require('fs');

var db = app.db;

/**
 * Compute & save color palette.
 */

app.on('screenshot', function(url, path, id){
  console.log('palette - reading %s', path);
  colors(path, function(err, colors){
    if (err) return console.error(err.stack);
    
  })
});

/**
 * Get colors for `path` and invoke `fn(err, colors)`.
 */

function colors(path, fn) {
  fs.readFile(path, function(err, buf){
    if (err) return fn(err);

    var canvas = new Canvas
      , ctx = canvas.getContext('2d')
      , img = new Image;

    img.src = buf;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var colors = palette(canvas, 8).map(rgb);
    fn(null, colors);
  });
}

/**
 * Return the RGB value for the `color`
 * array returned by palette().
 */

function rgb(color) {
  var r = color[0]
    , g = color[1]
    , b = color[2]
    , n = r << 16 | g << 8 | b;
  return n;
}