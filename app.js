
/**
 * Module dependencies.
 */

var express = require('../express')
  , redis = require('redis')
  , http = require('http');

app = express();

app.configure(function(){
  app.db = redis.createClient();
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('phantom', 'phantomjs');
  app.set('screenshots', '/tmp');
  app.set('root', __dirname);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler()); 
});

require('./routes');
require('./events');

http.createServer(app).listen(3000);

console.log("Express server listening for connections");
