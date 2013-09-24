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
        console.error(services);
        done();
      });
    });


    // var simpleApp = require('../../example/web/simple/mixdown.json');
    // var mixdown = new Mixdown(simpleApp);

    // assert.deepEqual(mixdown.config, simpleApp, 'Mixdown Instance should have its config set');

    // mixdown.init(function(err) {

    //   assert.ifError(err);
    //   assert.ok(global.logger, 'Logger should be attached to global namespace');
    //   assert.equal(mixdown.apps.length, 1, 'Mixdown should have generated 1 app');

    //   var app = mixdown.apps[0];
    //   assert.ok(app.plugins['hello-world'], 'Namespace should be initialized properly.');
    //   assert.equal(app.plugins['hello-world'].hello, 'bonjour', 'An interface attr should be specified.');
    //   assert.equal(app.plugins['hello-world'].sayHello(), 'bonjour', 'An interface attr should be specified.');

    //   done();
    // });

  });
});