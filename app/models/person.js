new function(_) { // closure
  eval(this.imports);

  var Person = Model.extend({
    constructor: function(properties) {
      this.base(properties);
    }
  });

  eval(this.exports);
};