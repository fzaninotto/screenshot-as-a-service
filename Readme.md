
# Screenshot application

  A simple screenshot application & web service powered by [Express](http://expressjs.com), Redis, [node-canvas](http://github.com/learnboost/node-canvas), [palette](http://github.com/visionmedia/palette), and [PhantomJS](http://www.phantomjs.org/).
  
  ![rest screenshot web service](http://f.cl.ly/items/3v0V1y290V422J3a2r2o/Grab.png) 

## Setup

  First [install](http://code.google.com/p/phantomjs/wiki/Installation) phantomjs,
  then clone this repo and install the deps:

```
$ npm install
```

  Run the app:

```
$ node app
Express server listening on port 3000
```

## Todo

  - infinite scroll page displaying rasters
  - service error handling
  - production config
  - request meta-data for the url (palette etc)
  - zmq workers + limit phantomjs concurrency
  - escape shell args
  - moar logging
  - dimensions
  - varnish

## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

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
