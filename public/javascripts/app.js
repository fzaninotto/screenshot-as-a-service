
// $ sucks

o = $;

// boot

o(function(){
  console.log(render('screenshot', { title: 'yay' }));
})

function render(name, obj) {
  var tmpl = template(name);
  return whiskers.render(tmpl, obj);
}

/**
 * Grab template `name`.
 */

function template(name) {
  return document
    .getElementById(name + '-template')
    .innerHTML;
}