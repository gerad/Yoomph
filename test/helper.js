new function(_) {
eval(Kite.provides());

/* load mocking */
var load = provide.load, loadMock = null;
provide.load = function() {
  return loadMock ?
    loadMock.apply(null, arguments):
    load.apply(null, arguments);
};
provide.load.mock = function(mocked) {
  loadMock = mocked;
};
provide.load.reset = function() {
  loadMock = null;
};

}