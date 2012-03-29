/**
 * Module dependencies.
 */
var express = require('express');

// global variables
config = require('config');
app    = express.createServer();

app.configure(function(){
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

require('./routes');

app.listen(3000);

console.log("Express server listening on port 3000");
