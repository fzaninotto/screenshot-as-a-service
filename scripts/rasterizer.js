/*
 * phantomjs rasterizer server
 *
 * Usage:
 *   phantomjs rasterizer.js [basePath] [port] [defaultViewportSize]
 *
 * This starts an HTTP server waiting for screenshot requests
 */
var basePath = phantom.args[0] || '/tmp/';
var port = phantom.args[1] || 3001;

var defaultViewportSize = phantom.args[2] || '';
defaultViewportSize = defaultViewportSize.split('x');
defaultViewportSize = {
  width: ~~defaultViewportSize[0] || 1024,
  height: ~~defaultViewportSize[1] || 600
};

var defaultPDFFormat = 'Letter',
    defaultPDFOrientation = 'portrait',
    defaultPDFMargin = {top: '5mm', bottom: '5mm'};

var pageSettings = ['javascriptEnabled', 'loadImages', 'localToRemoteUrlAccessEnabled', 'userAgent', 'userName', 'password'];

var server, service;

server = require('webserver').create();

/*
 * Screenshot service
 *
 * Generate a screenshot file on the server under the basePath.
 *
 * Usage:
 * GET /
 * url: http://www.google.com
 *
 * Optional headers for determining filetype of output:
 *   filename: google.png
 *
 *   Filetype of output is automatically based on filename extension.
 *   Allowed filetypes: .gif, .png, .jpeg, .pdf. If no filename header
 *   provided, defaults to .png.
 *
 * Optional headers for output to .png, .jpeg or .gif:
 *   width: 1024
 *   height: 600
 *   clipRect: { "top": 14, "left": 3, "width": 400, "height": 300 }
 *
 *   width and height represent the viewport size. If the content exceeds these
 *   boundaries and has a non-elastic style, the screenshot may have greater size.
 *   Use clipRect to ensure the final size of the screenshot in pixels.
 *
 * Optional headers for output to .pdf:
 *   pdfFormat: 'Letter'
 *   pdfOrientation: 'portrait'
 *   pdfMargin: {top: '5mm', bottom: '5mm'}
 *   pdfFooter: {height: '0cm', contents: ''}
 *
 *   pdfFormat can be in dimensions or a format:
 *      dimension examples: "5in*7.5in", "10cm*20cm"
 *      formats allowed: 'A3', 'A4', 'A5', 'Legal', Letter', 'Tabloid.'
 *   pdfOrientation allowed: 'portrait', 'landscape'
 *   pdfMargin examples: '0px', {top:'50px', left:'20px'}
 *   supported units for dimensions/margins: 'mm', 'cm', 'in', 'px'. No unit means 'px'.
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

  page.customHeaders = JSON.parse(request.headers.xheaders);
  page.onResourceError = function(resourceError) {
    page.error_reason = resourceError.errorString;
  };
  var delay = request.headers.delay || 0;
  try {
    page.viewportSize = {
      width: request.headers.width || defaultViewportSize.width,
      height: request.headers.height || defaultViewportSize.height
    };
    if (request.headers.clipRect) {
      page.clipRect = JSON.parse(request.headers.clipRect);
    }
    pageSettings.forEach(function(setting) {
      var value = request.headers[setting];
      if (value) {
        value = (value == 'false') ? false : ((value == 'true') ? true : value);
        page.settings[setting] = value;
      }
    });
    // if output format is .pdf, phantom requires page.paperSize info
    if (path.substr(-4) === '.pdf') {
      var pdfFormat = request.headers.pdfFormat || defaultPDFFormat,
          wxh = pdfFormat.split('*'),
          orientation = request.headers.pdfOrientation || defaultPDFOrientation,
          margin = request.headers.pdfMargin || defaultPDFMargin;
      if (typeof margin === 'string' && margin.indexOf('{') > -1) {
        margin = JSON.parse(margin);
      }
      var footer;
      if (request.headers.pdfFooter) {
        footer = JSON.parse(request.headers.pdfFooter);
        // wrap contents template with paging callback.
        var contents = footer.contents;
        footer.contents = phantom.callback(function(pageNum, numPages) {
          return contents.replace('{#pageNum}', pageNum).replace('{#numPages}', numPages);
        });
      }

      // 'pdfFormat' dictates paperSize obj structure:
      page.paperSize = wxh.length === 2 ? {
        width: wxh[0],
        height: wxh[1],
        margin: margin,
        footer: footer
      } : {
        format: pdfFormat,
        orientation: orientation,
        margin: margin,
        footer: footer
      };
    }
  } catch (err) {
    response.statusCode = 500;
    response.write('Error while parsing headers: ' + err.message);
    return response.close();
  }
  page.open(url, function(status) {
    if (status === 'success') {
      window.setTimeout(function () {
        page.render(path);
        response.write('Success: Screenshot saved to ' + path + "\n");
        page.release();
        response.close();
      }, delay);
    } else {
      response.write('Error: Url returned status ' + status + ' - ' + page.error_reason + "\n");
      page.release();
      response.close();
    }
  });
  // must start the response now, or phantom closes the connection
  response.statusCode = 200;
  response.write('');
});
