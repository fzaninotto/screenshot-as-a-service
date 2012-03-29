var page = new WebPage();

var url  = phantom.args[0];
if (!url) throw new Error('url required');
var path = phantom.args[1];
if (!path) throw new Error('output path required');

var size = phantom.args[2] || '';
size = size.split('x');

page.viewportSize = {
  width: ~~size[0] || 1024,
  height: ~~size[1] || 600
};

page.open(url, function (status) {
  if (status == 'success') {
    page.render(path);
    phantom.exit();
  } else {
    throw new Error('failed to load ' + url);
  }
});
