
# Screenshot application

  A simple screenshot application & web service powered by [Express](http://expressjs.com), Redis, [node-canvas](http://github.com/learnboost/node-canvas) and [palette](http://github.com/visionmedia/palette).
  
  ![rest screenshot web service](http://f.cl.ly/items/3O0L1u3D2h1t21074705/Grab.png) 

## Todo

  - infinite scroll page displaying rasters
  - service error handling
  - production config
  - zmq workers 
  - request meta-data for the url (palette etc)
  - dimensions
  - escape shell args
  - moar logging

## Setup

  First clone the repo, then install the deps with `npm`:
  
```
$ npm install
```

  Run the app:

```
$ node app
Express server listening on port 3000
```

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
