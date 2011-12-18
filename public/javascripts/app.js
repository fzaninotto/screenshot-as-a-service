
// $ sucks

o = $;

// boot

o(function(){
  render('screenshot', {
    title: 'Google',
    url: 'google.com'
  }).appendTo('body');

  render('screenshot', {
    title: 'Yahoo',
    url: 'yahoo.com'
  }).appendTo('body');

  render('screenshot', {
    title: 'Bing',
    url: 'bing.com'
  }).appendTo('body');
})

/**
 * Render the given template `name` with `obj`.
 */

function render(name, obj) {
  var tmpl = template(name);
  return $(whiskers.render(tmpl, obj));
}

/**
 * Grab template `name`.
 */

function template(name) {
  return document
    .getElementById(name + '-template')
    .innerHTML;
}