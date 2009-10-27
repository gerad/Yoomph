// kite.js - A JavaScript framework. (That doesn't piss me off).
// Requires base2 and jQuery

new function(_) { // closure
var KitePackage = new base2.Package(this, {
  name: "KitePackage",
  version: "0.1",
  exports: "Model"
});
eval(this.imports);

var Model = Base.extend({
  constructor: function(properties) {
    for (prop in properties)
      this.set(prop, properties[prop])
  },

  set: function(property, value) {
    this['_' + property] = value;
    return this;
  },

  get: function(property) {
    return this['_' + property];
  }
});

eval(this.exports);
};

// globalize the kite object
function Kite(callback) {
  var _ = {};
  _.root = '../../';
  _.appRoot = _.root + 'app/';

  return loadResources(callback);

  function loadResources(callback) {
    load(_.appRoot, ['resources.js'], function() {
      loadModels(callback);
    });
  }

  function loadModels(callback) {
    var js = Kite.resources['models'].map(function(m) { return m + '.js' });
    load(_.appRoot + 'models/', js, callback);
  }

  function load(root, paths, callback) {
    if (!paths.length) return callback();
    var path = root + paths.pop();
    $.getScript(path, function() {
      console.log('loading' + path);
      load(root, paths, callback);
    });
  }
}