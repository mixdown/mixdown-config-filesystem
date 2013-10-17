var _ = require('lodash');
var assert = require('assert');
var FilePlugin = require('../index.js');
var broadway = require('broadway');

suite('File System Config Plugin', function () {

  test('Get Services', function (done) {

    var app = new broadway.App();

    app.use(new FilePlugin(), {
      paths: ['/test/mixdown-services']
    });

    app.init(function(err) {

      assert.ifError(err);
      assert.ok( _.isFunction(app.externalConfig.getServices), "Get Services function should exist.");

      app.externalConfig.getServices(function(errServices, services) {
        
        assert.ifError(errServices);
        // console.error(services);
        done();
      });
    });
  });

  test('Test with bad path', function (done) {

    var app = new broadway.App();

    app.use(new FilePlugin(), {
      paths: ['/path/to/nowhere']
    });

    app.init(function(err) {

      assert.ifError(err);
      assert.ok( _.isFunction(app.externalConfig.getServices), "Get Services function should exist.");

      app.externalConfig.getServices(function(errServices, services) {
        
        assert.ok(errServices);
        // console.error(services);
        done();
      });
    });
  });

});