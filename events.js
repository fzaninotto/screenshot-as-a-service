
/**
 * Set screenshot:<id> hash.
 */

app.on('screenshot', function(path, id){
  app.db.hmset('screenshot:' + id, {
    path: path,
    id: id
  });
});

/**
 * Set screenshot:<id> hash.
 */

app.on('screenshot', function(path, id){
  app.db.hmset('screenshot:' + id, {
    path: path,
    id: id
  });
});