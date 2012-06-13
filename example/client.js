/**
 * Example of asynchronous screenshot
 */
var http = require('http');
var url  = require('url');
var fs   = require('fs');

// create a server to receive callbacks from the screenshot service
// and save the body to a PNG file
http.createServer(function(req, res) {
  var name = url.parse(req.url).pathname.slice(1);
  req.on('end', function () {
    res.writeHead(200);
    res.end();
  });
  req.pipe(fs.createWriteStream(__dirname + '/' + name + '.png'));
}).listen(8124);
console.log("Server running on port 8124");

var sites = {
  'google': 'http://www.google.com',
  'yahoo':  'http://www.yahoo.com'
};
var screenshotServiceUrl = 'http://localhost:3000/'; // must be running screenshot-app

// call the screenshot service using the current server as a callback
var poller = function() {
  for (name in sites) {
    var options = url.parse(screenshotServiceUrl + sites[name] + '?callback=http://localhost:8124/' + name);
    http.get(options, function(res) {});
  };
}
setInterval(poller, 60000);