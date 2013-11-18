var http = require('http'),
    express = require('express'),
    path = require('path');

var app = express();
app.set('port', 3999);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.compress());
app.use('/', express.static(path.join(__dirname, 'responses')));

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

exports = module.exports = server;
