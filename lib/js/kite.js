// kite.js - A JavaScript framework. (That doesn't piss me off).
// requires underscore.js and jquery.js

var Kite = new function() {

/* provide / provides */
var provide = this.provide = {}; // stuff Kite provides
provide.provide = provide; // provide 'provide'

this.provides = function provides() {
  var provides = [];
  for (name in provide) {
    provides.push('var ', name, ' = ', 'Kite.provide.', name, ';');
  }
  return provides.join('');
};

/* mixin */
var mixin = provide.mixin = function mixin(destination, source) {
  for (var name in source)
    destination[name] = source[name];
  return destination;
};

/* Class */
var Class = provide.Class = {
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
    mixin(NewClass.prototype, obj);

    // add in the class methods
    NewClass.constructor = NewClass;
    mixin(NewClass, Class.ClassMethods);

    return NewClass;
  },

  ClassMethods: {
    extend: function(fn) {
      return Class.create(fn, this);
    }
  }
};

provide.Deferred = Class.create(function(Deferred) {
  this.init = function(pause) {
    this._paused = pause;
    this._stack = [];

    var self = this;
    this._boundOkFn = function() { self.okFn.call(self, arguments); }
  };

  this.after = function after() {
    for(var i = 0; i < arguments.length; i++)
      this._stack.push(arguments[i]);
    this.run();
  };
  this.add = this.callback = this.after;

  this.run = function run() {
    var args = arguments;
    while (!this._paused && this._stack.length) {
      var nextFn = this._stack.shift();
      var res = nextFn.apply(null, args);

      if (res instanceof Deferred) this.join(res);
      else args = [res];
    }
  };

  this.join = function join(other) {
    this.pause();
    other.add(this.fn(this.restart, [], this));
  };
  this.waitFor = this.join;

  this.pause = function pause() {
    this._paused = true;
    return this;
  };
  this.stop = this.pause;

  this.restart = function restart() {
    this._paused = false;
    this.run.apply(this, arguments);
  };

  var okFn = this.okFn = function okFn() {
    this.restart.apply(this, arguments);
  };

  this.fn = function fn(callback, args, context) {
    var i = okFnIndex(args);
    if (i >= 0) {
      var shouldPause = true;
      args[i] = this._boundOkFn;
    }
    var self = this;
    return function() {
      if (shouldPause) self.pause();
      return callback.apply(context, args);
    };
  };

  function okFnIndex(args) {
    for (var i = 0; i < args.length; i++)
      if (args[i] == okFn) break;
    return i < args.length ? i: - 1;
  }
});

}; // end closure