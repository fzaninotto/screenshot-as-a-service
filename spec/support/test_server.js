var http = require('http'),
    express = require('express'),
    fs = require('fs'),
    path = require('path');

var app = express();
app.set('port', 3999);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.compress());
app.use('/', express.static(path.join(__dirname, 'responses')));
app.use('/cache_headers', function (req, res) {
  res.setHeader('cache-control', 'public, max-age=120');
  res.setHeader('expires', 'Thu, 01 Dec 1983 20:00:00 GMT');
  res.setHeader('etag', '1234567890');
  res.setHeader('vary', 'Test, Accept-Encoding');
  res.setHeader('pragma', 'no-cache');
  res.setHeader('x-unrelated-header', 'not forwarded');

  fs.readFile(path.join(__dirname, 'responses', 'response1.html'), 'utf8', function (err, data) {
    res.send(data);
  });
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

exports = module.exports = server;
