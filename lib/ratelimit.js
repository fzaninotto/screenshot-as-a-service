
var db = app.db;

/**
 * Limit `max` requests per n `mins`.
 *
 * @param {Number} max
 * @param {Number} mins
 * @return {Function}
 */

module.exports = function(max, mins){
  var min = 60
    , ttl = min * mins;

  return function(req, res, next){
    var addr = req.socket.remoteAddress;
    var key = 'limit:' + addr;
    res.set('X-Ratelimit-Max', max);

    db.get(key, function(err, n){
      if (err) return next(err);

      if (n > max) {
        var wait = ttl / min;
        res.set('X-Ratelimit', n);
        res.send(400, 'Limit exceeded! try again in ~' + wait + ' minutes\n');
      } else if (n) {
        res.set('X-Ratelimit', n);
        db.incr(key, next);
      } else {
        res.set('X-Ratelimit', 0);
        db.incr(key);
        db.expire(key, ttl, next);
      }
    });
  }
};