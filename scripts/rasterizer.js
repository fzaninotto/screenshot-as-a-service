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

var pageSettings = ['javascriptEnabled', 'loadImages', 'localToRemoteUrlAccessEnabled', 'userAgent', 'userName', 'password', 'waitFor', 'waitTimeout'];

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
  var waitFor = request.headers.waitFor != null ? decodeURIComponent(request.headers.waitFor) : null;
  var waitTimeout = request.headers.waitTimeout || 10000;
  try {
    page.viewportSize = {
      width: request.headers.width || defaultViewportSize.width,
      height: request.headers.height || defaultViewportSize.height
    };
    if (request.headers.clipRect) {
      page.clipRect = JSON.parse(request.headers.clipRect);
    }
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
  //TODO: Verbose option? 
  //page.onConsoleMessage = function(msg) {
  //  console.log(msg);
  //};
  page.open(url, function(status) {
    if (status == 'success') {
      var complete = function() {
        page.render(path);
        response.write('Success: Screenshot saved to ' + path + "\n");
        page.release();
        response.close();
      };

      // If a condition is specified, delay is ignored. Instead, use waitFor and waitTimeout
      // to specify a condition and maximum amount of time for condition to evaluate to true.
      // We pass complete twice to render a screenshot whether or not condition was fulfilled;
      // this leaves the code open to handle the error condition differently in the future.  
      if (waitFor != null) {
        waitForCondition(function() {
          return page.evaluate(function(waitFor) {
            // Remember: This is executed in the browser instance.
            var result = eval(waitFor);
            return result;
	  }, waitFor);
        }, complete, complete, waitTimeout);
      } else {
        window.setTimeout(function () {
          complete();
        }, delay);
      }
    } else {
      response.write('Error: Url returned status ' + status + "\n");
      page.release();
      response.close();
    }
  });
  // must start the response now, or phantom closes the connection
  response.statusCode = 200;
  response.write('');
});


/**
* Wait until the test condition is true or a timeout occurs. Useful for waiting
* on a server response or for a ui change (fadeIn, etc.) to occur.
*
* @param testFx javascript condition that evaluates to a boolean,
* it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
* as a callback function.
* @param onReady what to do when testFx condition is fulfilled,
* it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
* as a callback function.
* @param onTimeout what to do when max amount of time is reached
* @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
*
* Adapted from here:
* https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
*
*/
function waitForCondition(testFx, onReady, onTimeout, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function() {
      if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
        // If not time-out yet and condition not yet fulfilled
        condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
      } else {
        if(!condition) {
          // If condition still not fulfilled (timeout but condition is 'false')
          // console.log("'waitFor()' failed in " + (new Date().getTime() - start) + "ms.");
          typeof(onTimeout) === "string" ? eval(onTimeout) : onTimeout(); //< Do what's next if condition is not fulfilled in time
        } else {
          // Condition fulfilled (timeout and/or condition is 'true')
          // console.log("'waitFor()' succeeded in " + (new Date().getTime() - start) + "ms.");
          typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
        }
        clearInterval(interval); //< Stop this interval
      }
    }, 250); //< repeat check every 250ms
};
