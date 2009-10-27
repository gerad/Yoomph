new function(_) { // closure
  var PersonPackage = new base2.Package(this, {
    name: "PersonPackage",
    version: "0.1",
    imports: "KitePackage",
    exports: "Person"
  });
  eval(this.imports);

  var Person = Model.extend({
    constructor: function(properties) {
      this.base(properties);
    }
  });

  eval(this.exports);
};