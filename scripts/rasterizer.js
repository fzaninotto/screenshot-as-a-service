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

var pageSettings = ['javascriptEnabled', 'loadImages', 'localToRemoteUrlAccessEnabled', 'userAgent', 'userName', 'password'];

var server, service;

server = require('webserver').create();

/*
 * Screenshot service
 *
 * Generate a screenshot file on the server under the basePath
 *
 * Usage:
 * GET /
 * url: http://www.google.com
 *
 * Optional headers:
 * filename: google.png
 * width: 1024
 * height: 600
 * clipRect: { "top": 14, "left": 3, "width": 400, "height": 300 }
 *
 * If path is omitted, the service creates it based on the url, removing the
 * protocol and replacing all slashes with dots, e.g
 * http://www.google.com => www.google.com.png
 *
 * width and height represent the viewport size. If the content exceeds these
 * boundaries and has a non-elastic style, the screenshot may have greater size.
 * Use clipRect to ensure the final size of the screenshot in pixels.
 *
 * All settings of the WebPage object can also be set using headers, e.g.:
 * javascriptEnabled: false
 * userAgent: Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+
 */ 
service = server.listen(port, function(request, response) {
  if (request.url == '/healthCheck') {
    response.statusCode = 200;
    response.write('up');
    response.close();
    return;
  }
  if (!request.headers.url) {
    response.statusCode = 400;
    response.write('Error: Request must contain an url header' + "\n");
    response.close();
    return;
  }
  var url = request.headers.url;
  var path = basePath + (request.headers.filename || (url.replace(new RegExp('https?://'), '').replace(/\//g, '.') + '.png'));
  var page = new WebPage();
  var delay = request.headers.delay || 0;
  var readyExpression = request.headers.readyExpression;
  var forwardCacheHeaders = request.headers.forwardCacheHeaders;
  var retina = request.headers.retina;
  var clipSelector = request.headers.clipSelector;
  var clipRect;
  if (request.headers.clipRect) {
    clipRect = JSON.parse(request.headers.clipRect);
  }

  try {
    page.viewportSize = {
      width: request.headers.width || defaultViewportSize.width,
      height: request.headers.height || defaultViewportSize.height
    };
    for (name in pageSettings) {
      if (value = request.headers[pageSettings[name]]) {
        value = (value == 'false') ? false : ((value == 'true') ? true : value);
        page.settings[pageSettings[name]] = value;
      }
    }
  } catch (err) {
    response.statusCode = 500;
    response.write('Error while parsing headers: ' + err.message);
    return response.close();
  }

  if (forwardCacheHeaders) {
    var cacheHeaders = /cache-control|expires|etag|vary|pragma/i;
    page.onResourceReceived = function(resource) {
      if (resource.url === url && resource.status === 200) {
        page.cacheHeaders = resource.headers.filter(function (header) {
          return header.name.match(cacheHeaders);
        });
      }
    };
  }

  page.open(url, function(status) {

    var getClipRectFromSelector = function(selector) {
      return page.evaluate(function(selector) {
          try {
              var clipRect = document.querySelector(selector).getBoundingClientRect();
              return {
                  top: clipRect.top,
                  left: clipRect.left,
                  width: clipRect.width,
                  height: clipRect.height
              };
          } catch (e) {
              console.log("Unable to fetch bounds for element " + selector, "warning");
          }
      }, selector);
    };

    var onReady = function () {
      if (page.cacheHeaders) {
        page.cacheHeaders.forEach(function (header) {
          response.setHeader(header.name, header.value);
        });
      }
      if (retina) {
        page.evaluate(function () {
            document.body.style.webkitTransform = "scale(2)";
            document.body.style.webkitTransformOrigin = "0% 0%";
            document.body.style.width = "50%";
        });
      }
      if (clipRect) {
        page.clipRect = clipRect;
      } else if (clipSelector) {
        page.clipRect = getClipRectFromSelector(clipSelector);
      }
      page.render(path);
      response.write('Success: Screenshot saved to ' + path + "\n");
      page.release();
      response.close();
    };

    var watchdog = 50;
    var waitForReady = function () {
      var isReady = page.evaluate(function (expression) {
        return eval(expression);
      }, readyExpression);
      if (isReady || --watchdog <= 0) {
        onReady();
      } else {
        setTimeout(waitForReady, 100);
      }
    };

    if (status == 'success') {
      if (readyExpression) {
        waitForReady();
      } else {
        window.setTimeout(onReady, delay);
      }
    } else {
      response.write('Error: Url returned status ' + status + "\n");
      page.release();
      response.close();
    }
  });

  response.statusCode = 200;
});
