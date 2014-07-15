var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var async = require('async');
var BasePlugin = require('mixdown-app').Plugin;

module.exports = BasePlugin.extend({
  _namespace_default: 'config',
  init: function(options) {
    this._super(options);

    // this holds a pointer to the most recently loaded config.
    this._config = null;

    _.defaults(this._options, {
      paths: ['./config']
    });

    // ensure array
    if (!_.isArray(this._options.paths)) {
      this._options.paths = [this._options.paths];
    }
  },
  get: function(callback) {
    if (this._config) {
      callback(null, this._config);
    } else {
      throw new Error('External Config not initialized. Call setup().');
    }
  },
  crawl: function(callback) {

    var self = this;
    var full_paths = _.isArray(this._options.paths) ? this._options.paths : [this._options.paths];
    full_paths = _.map(full_paths, function(p) {
      return path.join(process.cwd(), p);
    });

    // get stats for all folders.
    var directory_stats = _.map(full_paths, function(file) {
      return function(cb) {

        var full_path = file;

        fs.exists(full_path, function(exists) {

          if (!exists) {
            cb(new Error('Directory does not exist.' + full_path));
            return;
          }

          fs.stat(full_path, function(err, stats) {

            cb(null, _.extend(stats, {
              full_path: file
            }));
          });
        });
      };
    });

    // filter the valid folders for controllers.
    async.parallel(directory_stats, function(err, results) {

      if (err) {
        callback(err);
        return;
      }

      // ensure we are only loading from directories.
      var dirs = _.filter(results, function(file_stats) {
        return file_stats.isDirectory();
      });

      // load all configs from each path
      var directory_ops = _.map(dirs, function(dir) {

        return function(cb) {
          // Load all the services from the folder.
          fs.readdir(dir.full_path, function(err, files) {
            cb(err, _.map(files, function(f) {
              return path.join(dir.full_path, f);
            }));
          });
        };
      });


      // run all load file_ops now.
      async.parallel(directory_ops, function(err, results) {
        var file_ops = [];

        if (err) {
          callback(err);
          return;
        }

        _.each(results, function(files) {

          // concat the list of loads for files in this directory.
          file_ops = file_ops.concat(_.filter(files, function(configFile) {
              return /\.(js|json)$/.test(configFile);
            })
            .map(function(configFile) {
              return function(cb) {

                var serviceConfig = null;
                try {
                  serviceConfig = require(configFile);
                  serviceConfig.id = path.basename(configFile.replace(/(\.js|\.json)$/, ''));
                } catch (e) {
                  cb(e);
                  return;
                }

                cb(null, serviceConfig);
              };

            })
          );
        });

        async.parallel(file_ops, callback);
      });

    });
  },
  _setup: function(done) {

    // crawl and load
    var self = this;
    this.crawl(function(err, services) {
      self._config = services;
      done(err);
    });
  }
});