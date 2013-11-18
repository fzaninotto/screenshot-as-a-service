var curl = require('node-curl'),
    path = require('path'),
    qs = require('qs'),
    Image = require('../node_modules/imagediff/node_modules/canvas/index').Image,
    imagediff = require('imagediff');


var getBaselineImage = function (name) {
  var image = new Image();
  image.src = path.join(__dirname, 'support', 'baselines', name);
  return image;
};

var getRasterisedImage = function (query) {
  if( Object.prototype.toString.call(query) == '[object Object]' ) {
     query = qs.stringify(query);
  }
  var image = new Image();
  curl('http://localhost:3000/?' + query, {RAW: 1}, function(err) {
    image.src = this.body;
  });
  return image;
};

var compareImages = function (baseline, query) {
  var baseline = getBaselineImage(baseline);
  var rasterised = getRasterisedImage(query);

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
    compareImages('1.png', {
      url: 'http://localhost:3999/response1.html'
    });
  });

  it('should render an image with custom viewport size', function () {
    compareImages('2.png', {
      url: 'http://localhost:3999/response1.html',
      width: 400,
      height: 400
    });
  });

  it('should render an image with javascript disabled', function () {
    compareImages('3.png', {
      url: 'http://localhost:3999/response1.html',
      javascriptEnabled: false
    });
  });

  it('should render an image with clipRect', function () {
    compareImages('4.png', {
      url: 'http://localhost:3999/response1.html',
      clipRect: '{"top": 20, "left": 20, "width": 80, "height": 100 }'
    });
  });
  
});
