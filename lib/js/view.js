new function(_) { // closure
eval(Kite.provides());

var View = provide.View = Class.create(function(View) {
  this.init = function() {
		this._templates = [];
	};

  this.render = function(name, context) {
    return this._templates[name].render(context || {});
  };

  this.template = function(name, containerFn) {
		this._templates[name] = new Template(this, containerFn);
	};
});

var Template = provide.View.Template = Class.create(function(Template) {
  this.init = function(view, containerFn) {
		this.view = view;
		this.containerFn = containerFn;

		var self = this;
		this.helper = {
			render: function() {
				return self.view.render.apply(self.view, arguments);
			}
		};
  };

  this.render = function(context) {
    this.fn = this.fn || build(this.containerFn);
    return this.fn(context, this.helper);
  };

  function build(containerFn) {
		var str = commentContents(containerFn);
		return compile(str);
	}

  // JavaScript templating a-la ERB, pilfered from John Resig's
  // "Secrets of the JavaScript Ninja", page 83.
  // from underscore.js
  function compile(str) {
    return new Function('obj','helper',
      'var p=[],print=function(){p.push.apply(p,arguments);};' +
      'with(helper){with(obj){p.push(\'' +
      str
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'")
    + "');}}return p.join('');");
  }

  function commentContents(containerFn) {
    return containerFn.toString()
      .replace(/^function.*?\/\*\s*/, '')
      .replace(/\s*\*\/.*?$/, '');
  };
});

}