
var db = app.db;

/**
 * Set screenshot:<id> hash.
 */

app.on('screenshot', function(url, path, id){
  db.zadd('screenshots', Date.now(), id);
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