
/**
 * Module dependencies.
 */

var express = require('../express')
  , http = require('http');

app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('phantom', 'phantomjs');
  app.set('root', __dirname);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler()); 
});

require('./routes');

http.createServer(app).listen(3000);

console.log("Express server listening for connections");
