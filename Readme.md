# Screenshot as a Service

A simple screenshot web service powered by [Express](http://expressjs.com) and [PhantomJS](http://www.phantomjs.org/). Forked from [screenshot-app](http://github.com/visionmedia/screenshot-app).

## Setup

First [install](http://code.google.com/p/phantomjs/wiki/Installation) phantomjs, then clone this repo and install the deps:

```
$ npm install
```

Run the app:

```
$ node app
Express server listening on port 3000
```

## Usage

```sh
# standard 1024x600 screenshot
$ curl http://localhost:3000/www.google.com > google.png

# custom viewport size
$ curl 'http://localhost:3000/www.google.com?width=800&height=600' > google.png

# asynchronous screenshot
$ curl 'http://localhost:3000/www.google.com?callback=http://www.myservice.com/screenshot/google'
# this will send the screenshot in the body of a POST request to the callback url
```

## Configuration

Create a `config/development.yaml` or a `config/production.yaml` to override any of the settings found in the `config/default.yaml`:

```yml
browser:
  command: phantomjs
  viewport:
    width:    1024
    height:   600
tmpdir: '/tmp'
```

For instance, if you want to setup a proxy for phantomjs, create a `config/development.yaml` as follows:

```yml
browser:
  command: 'phantomjs --proxy=myproxy:1234'
```

## Usage Example

Here is an example application that takes asynchronous screenshots of a list of websites at regular intervals and saves them to disk:

```js
var http = require('http');
var url  = require('url');
var fs   = require('fs');

// create a server to receive callbacks from the screenshot service
// and save the body to a PNG file
http.createServer(function(req, res) {
  var name = url.parse(req.url).pathname.slice(1);
  req.pipe(fs.createWriteStream(__dirname + '/' + name + '.png'));
  res.writeHead(200)
  res.end();
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
* Limit the number of phantomjs processes to avoid server explosion
* Implement a simple queuing system forcing the use of asynchronous screenshots when the number of browser processes reaches the limit
* Use phantomjs server capabilities to avoid closing browser processes and send them demands continously 

## License

(The MIT License)

Copyright (c) 2012 François Zaninotto, TJ Holowaychuk &lt;tj@vision-media.ca&gt;

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
