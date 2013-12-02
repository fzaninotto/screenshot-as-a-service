var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    qs = require('qs'),
    Image = require('../node_modules/imagediff/node_modules/canvas/index').Image,
    imagediff = require('imagediff');


var setBaseline = process.env.SET_BASELINE;

var getBaselineImagePath = function (name) {
  return path.join(__dirname, 'support', 'baselines', name);
};

var getBaselineImage = function (name) {
  var image = new Image();
  image.src = getBaselineImagePath(name);
  return image;
};

var getRasterisedBuffer = function (query, callback) {
  if( Object.prototype.toString.call(query) == '[object Object]' ) {
     query = qs.stringify(query);
  }

  var src = "";
  http.get('http://localhost:3000/?' + query, function (res) {
    res.setEncoding('binary');
    res.on('data', function (chunk) {
      src += chunk;
    });
    res.on('end', function () {
      callback(src, res);
    });
  });
};

var getRasterisedImage = function (query, callback) {
  var image = new Image();
  getRasterisedBuffer(query, function (src, res) {
    image.src = new Buffer(src, 'binary');
    if (callback) {
      callback(res);
    }
  });
  return image;
};

var compareImages = function (baselineName, query, responseCallback) {
  if (setBaseline) {
    getRasterisedBuffer(query, function (src) {
      fs.writeFile(getBaselineImagePath(baselineName), src, { encoding: 'binary' }, function (err) {
        if (err) throw err;
        console.log('Updated baseline image for ' + baselineName);
      });
    });
  } else {
    var baseline = getBaselineImage(baselineName);
    var rasterised = getRasterisedImage(query, responseCallback);

    waitsFor(function () {
      return baseline.complete && rasterised.complete;
    }, 'image not loaded.', 4000);

    runs(function () {
      expect(rasterised).toImageDiffEqual(baseline);
    });
  }

};

describe("screenshot-as-a-service", function () {

  beforeEach(function () {
    this.addMatchers(imagediff.jasmine);
  });

  it('should render an image with default options', function () {
    compareImages('default.png', {
      url: 'http://localhost:3999/default'
    });
  });

  it('should render an image with custom viewport size', function () {
    compareImages('viewport.png', {
      url: 'http://localhost:3999/default',
      width: 400,
      height: 400
    });
  });

  it('should render an image with javascript disabled', function () {
    compareImages('noscript.png', {
      url: 'http://localhost:3999/default',
      javascriptEnabled: false
    });
  });

  it('should render an image clipped to a rectangle', function () {
    compareImages('cliprect.png', {
      url: 'http://localhost:3999/default',
      clipRect: '{"top": 20, "left": 20, "width": 80, "height": 100 }'
    });
  });

  it('should render an image clipped to an element defined by a selector', function () {
    compareImages('clipselector.png', {
      url: 'http://localhost:3999/default',
      clipSelector: '.rect'
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

  it("should render an image after a delay", function () {
    compareImages('delay.png', {
      url: 'http://localhost:3999/default',
      delay: 1500
    });
  });

  it("should render an image when an expression evaluates true", function () {
    compareImages('delay.png', {
      url: 'http://localhost:3999/default',
      readyExpression: '!!document.querySelector(".rect2")'
    });
  });

  it("should render an image at retina resolution", function () {
    compareImages('retina.png', {
      url: 'http://localhost:3999/default',
      retina: true
    });
  });
});
