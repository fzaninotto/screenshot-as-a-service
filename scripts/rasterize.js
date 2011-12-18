var page = require('webpage').create()
  , url = phantom.args[0]
  , path = phantom.args[1];

if (!url) throw new Error('url required');
if (!path) throw new Error('output path required');

page.viewportSize = {
    width: 600
  , height: 600
};

page.open(url, function (status) {
  if (status == 'success') {
    page.render(path);
    phantom.exit();
  } else {
    throw new Error('failed to load ' + url);
  }
});
