
# Screenshot Service

  A simple screenshot web service powered by [Express](http://expressjs.com) and [PhantomJS](http://www.phantomjs.org/).

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

## Usage

```
wget -O screenshot.png http://localhost:3000/www.google.com
```

## Configuration

Create a `config/development.yaml` or a `config/production.yaml` to override any of those settings:

```
browser:
  command: phantomjs
  options: ''
  viewport:
    width:    1024
    height:   600
screenshot:
  directory: '/tmp'
```

For instance, if you use a wrapper command for phantomjs and need to setup a proxy in development, create a `config/development.yaml`as follows:

```
browser:
  command: phantomjs-wrapper
  options: '--proxy=myproxy:1234
```

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
