var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var path = require('path');
var async = require('async');

var FileSystemConfig = function(options) {
  this.options = _.defaults(options || {}, {
    paths: ['/mixdown-services']
  });

  // TODO: update getServices to support multiple folder paths.  
  if (this.options.paths.length > 1) {
    throw new Error('Mixdown will support multiple paths, but this is not yet supported.');
  }
};

util.inherits(FileSystemConfig, EventEmitter);

/**
* Initializes config, sets up listener for site changes.  If init succeeds, then 'site' on a single change, 'sites' when all are updated, and 'error' events are emitted.
* @param callback - function(err, sites) where sites is an array of all sites.
**/
FileSystemConfig.prototype.init = function(done) {
  done();
};

FileSystemConfig.prototype.getServices = function(callback) {
  var definedPath = this.options.paths && this.options.paths.length ? this.options.paths[0] : null;
  var servicesPath = path.join(process.cwd(), definedPath || 'mixdown-services');

  // check for path
  fs.exists(servicesPath, function(exists) {

    if (!exists) {

      // if the user specifically defined the path, then throw error.  Otherwise, this is an optimistic search for the default path so it is not an error.
      var err = definedPath ? new Error('Services path does not exist.  path: ' + servicesPath) : null;
      callback(err);
      return;
    }

    // Load all the services from the folder.
    fs.readdir(servicesPath, function(err, files) {

      var ops = _.map(files, function(configFile) {

        return function(cb) {

          var serviceConfig = null;
          try {
            serviceConfig = require(path.join(servicesPath, configFile));
            serviceConfig.id = configFile.replace(/(\.js|\.json)$/, '');
          } catch (e) {
            cb(e);
            return;
          }

          cb(null, serviceConfig);
        };

      });

      async.parallel(ops, callback);
    });

  });
};

var FileSystemConfigPlugin = function(namespace) {
  namespace = namespace || 'externalConfig';

  this.attach = function(options) {
    this.externalConfig = new FileSystemConfig(options);
  };
  this.init = function(done) {
    this.externalConfig.init(done);
  };
};

module.exports = FileSystemConfigPlugin;