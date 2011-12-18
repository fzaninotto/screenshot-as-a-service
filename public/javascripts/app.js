
// $ sucks

o = $;

// boot

o(function(){
  screenshots(0, 5, function(objs){
    objs.forEach(function(obj){
      render('screenshot', {
        title: obj.url.replace(/^https?:\/\//, ''),
        url: obj.url
      }).appendTo('body');
    })
  });
})

function screenshots(from, to, fn) {
  o.get('/screenshots/' + from + '..' + to, fn);
}

/**
 * Render the given template `name` with `obj`.
 */

function render(name, obj) {
  var tmpl = template(name);
  return o(whiskers.render(tmpl, obj));
}

/**
 * Grab template `name`.
 */

function template(name) {
  return document
    .getElementById(name + '-template')
    .innerHTML;
}