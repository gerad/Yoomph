// kite.js - A JavaScript framework. (That doesn't piss me off).

var Kite = new function() {

function mixin(destination, source) {
  for (var name in source)
    destination[name] = source[name];
  return destination;
}


/* Class */


/*
// Model
(function() {
  var initializing = false;
  var id = 0;

  Kite.Model = {};
  Kite.Model.Base = function Base() {
    var _ = {}, self = this;
    _.store = {};
    self.save = function save() {
      arguments.callee._type;
    }
  }
  Base._type = 'Base';
  Base.save = function() {
    
  }

  Base.subClass = function(name, properties) {

    // make instanceof work
    initializing = true;
    var proto = new this();
    initializing = false;

    mixin(proto, properties);

    function Class() {
      var _ = {}, // private
        self = this; // public

      if ( !(self instanceof arguments.callee) )
        return new self.apply(self, arguments);

      // All construction is actually done in the init method

    };
    Class.prototype = proto;
    Class.constructor = Class;
    Class.subClass = arguments.callee;
    Class._type = name;
    return Class;
  }
  
})
*/

var Class = this.Class = {
  create: function(fn, superClass) {
    var quick;
    function NewClass() {
      var __class__ = arguments.callee;
      if (!(this instanceof __class__))
        throw "Attempt to create class without 'new' keyword";

      if (!quick && 'init' in this) {
        this.__class__ = __class__;
        this.__super__ = superClass;
        this.init.apply(this, arguments);
      }
    };

    // handle the super class
    if (superClass) {
      NewClass.__super__ = superClass;
      quick = true;
      NewClass.prototype = new superClass();
      quick = false;
    }

    // add in the instance methods
    var obj = new fn(NewClass);
    mixin(NewClass.prototype, Class.PrototypeMethods);
    mixin(NewClass.prototype, obj);

    // add in the class methods
    NewClass.constructor = NewClass;
    mixin(NewClass, Class.ClassMethods);

    return NewClass;
  },

  PrototypeMethods: {
    mixin: function(otherClass) {
      return mixin(this, otherClass.prototype);
    },
    imixin: function(otherObj) {
      return mixin(this, otherObj);
    }
  },

  ClassMethods: {
    extend: function(fn) {
      return Class.create(fn, this);
    },
    cmixin: function(otherClass) {
      return mixin(this, otherClass);
    }
  }
};

/*
// Templating - from Secrets of the JavaScript Ninja
(function(){
  var cache = {};

  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")  
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
        + "');}return p.join('');");

      // Provide some basic currying to the user
    return data ? fn( data ) : fn; };
})();
*/

var provides = [];
for (name in this) {
  provides.push('var ', name, ' = ', 'Kite.', name, ';');
}
this.provides = provides.join('');
};
