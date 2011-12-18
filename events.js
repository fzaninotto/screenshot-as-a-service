
var parse = require('url').parse;
var db = app.db;

/**
 * Set screenshot:<id> hash.
 */

app.on('screenshot', function(url, path, id){
  var now = Date.now();
  db.zadd('screenshot:ids', now, id);
  db.zadd('screenshot:urls', now, url);
  db.zadd('screenshot:hosts', now, parse(url).host);
  db.hmset('screenshot:' + id, {
    path: path,
    url: url,
    id: id
  });
});

/**
 * Screenshot statistics.
 */

app.on('screenshot', function(url, path, id){
  db.hincrby('screenshot:stats', 'total', 1);
});