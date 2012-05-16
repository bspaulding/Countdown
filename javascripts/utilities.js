if ( !Function.prototype.bind ) {
  Function.prototype.bind = function(scope) {
    var _function = this;

    return function() {
      return _function.apply(scope, arguments);
    }
  }
}

var _ = {};
_.map = function(c,f) { var r = []; for ( var i = 0; i < c.length; i += 1) { r.push(f(c[i])); } return r; };
_.reject = function(c,f) { var r = []; for ( var i = 0; i < c.length; i += 1) { if ( !f(c[i]) ) { r.push(c[i]); } } return r; };
_.select = function(c,f) { var r = []; for ( var i = 0; i < c.length; i += 1) { if (  f(c[i]) ) { r.push(c[i]); } } return r; };
_.merge = function(c) { var o = {}; for ( var i = 0; i < c.length; i += 1 ) { for ( var k in c[i] ) { o[k] = c[i][k]; } } return o; }

_.css = function(e,k,v) {
  var style = e.getAttribute('style');
  var sanitized = _.reject(style.split(';'), function(i) { return i === ""; });
  sanitized = _.map(sanitized, function(i) { return i.trim(); });
  var objects = _.map(sanitized, function(i) { var h = {}; var s = i.split(':'); h[s[0].trim()] = s[1].trim(); return h; });
  var styleObject = _.merge(objects);

  if ( v ) {
    styleObject[k] = v;
    style = '';
    for ( var key in styleObject ) {
      style += key + ':' + styleObject[key] + ';';
    }
    e.setAttribute('style', style);
  }

  return styleObject[k];
}
