var _ = require('lodash');
var assert = require('assert');
var FilePlugin = require('../index.js');
var App = require('mixdown-app').App;

suite('File System Config Plugin', function() {

  test('Get Services', function(done) {

    var app = new App();

    app.use(new FilePlugin({
      paths: ['/test/mixdown-services']
    }), 'config');

    app.setup(function(err) {

      if (err) {
        console.error(err);
      }

      assert.ifError(err);
      assert.ok(_.isFunction(app.config.get), "Get Services function should exist.");

      app.config.get(function(errServices, services) {

        if (errServices) {
          console.error(errServices);
        }
        assert.ifError(errServices);
        assert.equal(services[0].id, 'web1', 'Check for correct service name');
        assert.equal(services[1].id, 'web2', 'Check for correct service name');
        // console.error(services);
        done();
      });
    });
  });

  test('Test with bad path', function(done) {

    var app = new App();

    app.use(new FilePlugin({
      paths: ['/path/to/nowhere']
    }), 'config');

    app.setup(function(err) {

      if (err) {
        console.error(err);
      }

      assert.ok(err, 'Should return error');
      done();

    });
  });

});