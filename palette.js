
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
  fs.readFile(path, function(err, buf){
    if (err) return console.error(err.stack);

    var canvas = new Canvas
      , ctx = canvas.getContext('2d')
      , img = new Image;

    img.src = buf;
    canvas.width = img.width;
    canvas.height = img.height + 50;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    paintPalette(canvas);
    fs.writeFile('/tmp/out.png', canvas.toBuffer(), function(err){
      if (err) throw err;
      console.log('saved');
    });
  });
});

function paintPalette(canvas) {
  var x = 0;
  var colors = palette(canvas)
    , ctx = canvas.getContext('2d');
  colors.forEach(function(color){
    var r = color[0]
      , g = color[1]
      , b = color[2]
      , val = r << 16 | g << 8 | b
      , str = '#' + val.toString(16);

    ctx.fillStyle = str;
    ctx.fillRect(x += 31, canvas.height - 40, 30, 30);
  });
}