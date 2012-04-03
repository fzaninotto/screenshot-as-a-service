/*
 * phantomjs rasteriser server
 *
 * Usage:
 *   phantomjs rasterizer.js [basePath] [port] [defaultViewportSize]
 *
 * This starts an HTTP server waiting for screenshot requests
 */
var basePath = phantom.args[0] || '/tmp/'; 

var port  = phantom.args[1] || 3001;

var defaultViewportSize = phantom.args[2] || '';
defaultViewportSize = defaultViewportSize.split('x');
defaultViewportSize = {
  width: ~~defaultViewportSize[0] || 1024,
  height: ~~defaultViewportSize[1] || 600
};

var page = new WebPage();
var pageSettings = ['javascriptEnabled', 'loadImages', 'localToRemoteUrlAccessEnabled', 'userAgent', 'userName', 'password'];

var server, service;

server = require('webserver').create();

/*
 * Screenshot route
 *
 * Generate a screenshot file on the server under the basePath
 *
 * Usage:
 * GET /http%3A%2F%2Fwww.google.com
 * path: google.png
 * 
 * Optional headers:
 * width: 1024
 * height: 600
 *
 * All settings of the WebPage object can also be set using headers, e.g.
 * javascriptEnabled: false
 * userAgent: Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+
 *
 * Note that the URI to be polled must be url-encoded using the encodeURIComponent() function
 */ 
service = server.listen(port, function(request, response) {

  var url = urlDecode(request.url.substr(1));
  var path = basePath + (request.headers.path || (url.replace(new RegExp('https?:/'), '').replace('/', '.') + '.png'));

  page.viewportSize = {
  	width: request.headers.width || defaultViewportSize.width,
  	height: request.headers.height || defaultViewportSize.height
  };
  for (name in pageSettings) {
    if (value = request.headers[name]) {
      value = (value == 'false') ? false : ((value == 'true') ? true : value);
      page.settings[name] = value;
    }
  };
  page.open(url, function(status) {
    if (status == 'success') {
      page.render(path);
      page.release();
      response.statusCode = 200;
      response.close();
    } else {
      response.statusCode = 404;
      response.write('Failed to load ' + url);
      response.close();
    }
  });
});

function urlDecode(str) {
   return decodeURIComponent((str + '').replace(/\+/g, '%20'));
}