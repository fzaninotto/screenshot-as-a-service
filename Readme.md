# Screenshot as a Service

A simple screenshot web service powered by [Express](http://expressjs.com) and [PhantomJS](http://www.phantomjs.org/). Forked from [screenshot-app](http://github.com/visionmedia/screenshot-app).

## Setup

### Production setup

- [Install PhantomJS](http://phantomjs.org/download.html)
- Install dependencies:
```bash
$ npm install --production
```

### Development setup

In order to run the tests, additional dependencies are required.

- [Install PhantomJS](http://phantomjs.org/download.html)
- [Install node-canvas dependencies](https://github.com/LearnBoost/node-canvas/wiki/_pages)
- Install dependencies:
```bash
$ npm install
```

## Running the app

```bash
$ node app
Express server listening on port 3000
```

## Tests

```bash
$ ./run_specs.sh
```


## Usage

For a quick test with the command line, type:

```sh
$ curl http://localhost:3000/?url=www.google.com > google.png
```

Here is the complete usage documentation, also accessible on `/usage.html`:

```
# Take a screenshot
GET /?url=www.google.com
# Return a 1024x600 PNG screenshot of the www.google.com homepage

# Custom viewport size
GET /?url=www.google.com&width=800&height=600
# Return a 800x600 PNG screenshot of the www.google.com homepage

# Disable JavaScript
GET /?url=www.google.com&javascriptEnabled=false
# Return a screenshot with no JavaScript executed

# Custom User Agent
GET /?url=www.google.com&userAgent=Mozilla%2F5.0+%28iPhone%3B+CPU+iPhone+OS+5_0+like+Mac+OS+X%29+AppleWebKit%2F534.46+%28KHTML%2C+like+Gecko%29+Version%2F5.1+Mobile%2F9A334+Safari%2F7534.48.3
# Return a screenshot using an iPhone browser
# (User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3)

# Clipping rectangle
GET /?url=www.google.com&clipRect=%7B"top"%3A14%2C"left"%3A3%2C"width"%3A400%2C"height"%3A300%7D
# Return a screenshot clipped at {"top":14,"left":3,"width":400,"height":300}
# When both 'clipRect' and 'clipSelector' are specified, 'clipRect' takes
# precedence.

# Clipping rectangle from selector
GET /?url=www.google.com&clipSelector=#hplogo
# Return a screenshot clipped to the element specified by 'clipSelector'.
# When both 'clipRect' and 'clipSelector' are specified, 'clipRect' takes
# precedence.

# HTTP Authentication
GET /?url=www.mysite.com&userName=johndoe&password=S3cr3t
# Return a screenshot of a website requiring basic http authentication

# Asynchronous call
GET /?url=www.google.com&callback=http://www.myservice.com/screenshot/google
# Return an empty response immediately (HTTP 200 OK),
# then send a POST request to the callback URL when the screenshot is ready
# with the PNG image in the body.

# Screenshot delay
GET /?url=www.google.com&delay=1000
# Return a 1024x600 PNG screenshot of the www.google.com homepage
# 1 second after it's loaded

# Evented screenshot delay
GET /?url=www.modernizr.com&readyExpression=$("html").hasClass("js")
# Return a 1024x600 PNG screenshot of the www.modernizr.com homepage
# when 'html' tag receives class 'js'. The 'readyExpression' gets evaluated
# repeatedly in the page context, the screenshot gets taken once it evaluates
# to true. There is a timeout of 5 seconds after which the screenshot is
# taken regardless.

# Use an HTML form to ask for a screenshot
GET /form.html

# Forwarding cache headers
GET /?url=www.modernizr.com&forwardCacheHeaders=true
# Return a 1024x600 PNG screenshot of the www.modernizr.com homepage
# and set caching-related headers of the screenshot's HTTP response to match
# those of the original page HTTP response. Headers affected are
# 'cache-control', 'expires', 'etag', 'vary' and 'pragma'.
# Cache header forwarding only works when a screenshot is rasterized, not
# when the screenshot is retrieved from the internal file cached (see below).
```

## Internal file cache

Screenshots can be cached, so that frequent requests for the same screenshot
don't slow the service down. When a cached screenshot is served, the
'forwardCacheHeaders' option does not work. File cache is disabled by
default.

## Configuration

Create a `config/development.yaml` or a `config/production.yaml` to override any of the settings found in the `config/default.yaml`:

```yml
rasterizer:
  command: phantomjs   # phantomjs executable
  port: 3001           # internal service port. No need to allow inbound or outbound access to this port
  path: '/tmp/'        # where the screenshot files are stored
  viewport: '1024x600' # browser window size. Height frows according to the content
cache:
  lifetime: 0          # cache time in milliseconds, 0 disables
server:
  port: 3000           # main service port
```

For instance, if you want to setup a proxy for phantomjs, create a `config/development.yaml` as follows:

```yml
rasterizer:
  command: 'phantomjs --proxy=myproxy:1234'
```

## Asynchronous Usage Example

Here is an example application that takes asynchronous screenshots of a list of websites at regular intervals and saves them to disk:

```js
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
var screenshotServiceUrl = 'http://my.screenshot.app:3000/'; // must be running screenshot-app

// call the screenshot service using the current server as a callback
var poller = function() {
  for (name in sites) {
    var options = url.parse(screenshotServiceUrl + sites[name] + '?callback=http://localhost:8124/' + name);
    http.get(options, function(res) {});
  };
}
setInterval(poller, 60000);
```

Every minute, this script will refresh the two screenshots `google.png` and `yahoo.png`.

## TODO

* Allow to configure phantomjs options through YAML config
* Implement a simple queuing system forcing the use of asynchronous screenshots when the number of browser processes reaches the limit

## License

(The MIT License)

Copyright (c) 2012-2013 HM Government (Government Digital Service), François Zaninotto, TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
