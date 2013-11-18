var http = require('http'),
    path = require('path'),
    qs = require('qs'),
    Image = require('../node_modules/imagediff/node_modules/canvas/index').Image,
    imagediff = require('imagediff');


var getBaselineImage = function (name) {
  var image = new Image();
  image.src = path.join(__dirname, 'support', 'baselines', name);
  return image;
};

var getRasterisedImage = function (query, callback) {
  if( Object.prototype.toString.call(query) == '[object Object]' ) {
     query = qs.stringify(query);
  }
  var image = new Image();

  var src = "";
  http.get('http://localhost:3000/?' + query, function (res) {
    res.setEncoding('binary');
    res.on('data', function (chunk) {
      src += chunk;
    });
    res.on('end', function () {
      image.src = new Buffer(src, 'binary');

      if (callback) {
        callback(res);
      }
    });
  });

  return image;
};

var compareImages = function (baseline, query, responseCallback) {
  var baseline = getBaselineImage(baseline);
  var rasterised = getRasterisedImage(query, responseCallback);

  waitsFor(function () {
    return baseline.complete && rasterised.complete;
  }, 'image not loaded.', 2000);

  runs(function () {
    expect(rasterised).toImageDiffEqual(baseline);
  });
};

describe("screenshot-as-a-service", function () {

  beforeEach(function () {
    this.addMatchers(imagediff.jasmine);
  });

  it('should render an image with default options', function () {
    compareImages('default.png', {
      url: 'http://localhost:3999/response1.html'
    });
  });

  it('should render an image with custom viewport size', function () {
    compareImages('viewport.png', {
      url: 'http://localhost:3999/response1.html',
      width: 400,
      height: 400
    });
  });

  it('should render an image with javascript disabled', function () {
    compareImages('noscript.png', {
      url: 'http://localhost:3999/response1.html',
      javascriptEnabled: false
    });
  });

  it('should render an image with clipRect', function () {
    compareImages('cliprect.png', {
      url: 'http://localhost:3999/response1.html',
      clipRect: '{"top": 20, "left": 20, "width": 80, "height": 100 }'
    });
  });

  it("should render an image and forward cache headers", function () {
    compareImages('default.png', {
      url: 'http://localhost:3999/cache_headers',
      forwardCacheHeaders: true
    }, function (res) {
      var headers = res.headers;
      expect(headers['cache-control']).toEqual('public, max-age=120');
      expect(headers.expires).toEqual('Thu, 01 Dec 1983 20:00:00 GMT');
      expect(headers.etag).toEqual('1234567890');
      expect(headers.vary).toEqual('Test, Accept-Encoding');
      expect(headers.pragma).toEqual('no-cache');
      expect(headers['x-unrelated-header']).not.toBeDefined();
    });
  });
  
});
