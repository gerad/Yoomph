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

/* Deferred */
var Deferred = provide.Deferred = Class.create(function(Deferred) {
  this.init = function(context) {
    this._context = context;
    this._stack = [];

    var self = this;
    this._boundOkFn = function() { self.okFn.apply(self, arguments); };
  };

  this.after = function after() {
    for(var i = 0; i < arguments.length; i++) {
      var obj = arguments[i];
      this._stack.push({
        ok: ('ok' in obj ? obj.ok : obj),
        error: ('error' in obj ? obj.error : undefined)
      });
    }
    this.run();
		return this;
  };
  this.add = this.callback = this.next =  this.after;

  this.run = function run() {
    this._args = arguments.length ? arguments : this._args;
    while (!this._paused && this._stack.length) {
      var res, n = this._stack.shift();
      var nextFn = res instanceof Error ? n.error : n.ok;

      if (!nextFn) throw res;
      try {
        res = nextFn.apply(this._context, this._args);
      } catch(e) {
        res = e instanceof Error ? e : new Error(e);
      }

      if (res instanceof Deferred && res !== this) this.join(res);
      else this._args = [res];
    }

    if (res instanceof Error) throw res;
		return this;
  };

  this.join = function join(other) {
    this.pause();

    var self = this;
    other.add(function() { self.restart.apply(self, arguments); });

		return this;
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
		return this;
  };

  var okFn = this.okFn = function okFn() {
    this.restart.apply(this, arguments);
  };

  this.fn = function fn(callback, args, context) {
		context = context || this._context;
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

/* load */
// TODO use LABjs?
provide.load = function load() {
  var head = document.getElementsByTagName('head')[0];

  var d = new Deferred();
  for (var i = 0; i < arguments.length; i++) {
    d.add(d.fn(addScript, [arguments[i], d.okFn]));
  }
  return d;

  function addScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;

    var loaded = false;
    script.onload = script.onreadystatechange = function() {
      if (loaded) return;
      if ('readyState' in this &&
        !( this.readyState === 'loaded'
        || this.readyState === 'complete')) return;
      loaded = true;
      script.onload = script.onreadystatechange = null;
      head.removeChild(script);
      callback(); // completed
    };

    head.appendChild(script);
  }
};

}; // end closure