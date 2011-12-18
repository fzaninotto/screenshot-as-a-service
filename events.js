
var db = app.db;

/**
 * Set screenshot:<id> hash.
 */

app.on('screenshot', function(path, id){
  db.zadd('screenshots', Date.now(), id);

  db.hmset('screenshot:' + id, {
    path: path,
    id: id
  });
});

/**
 * Screenshot statistics.
 */

app.on('screenshot', function(path, id){
  db.hincrby('screenshot:stats', 'total', 1);
});