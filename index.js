var minimatch = require('minimatch');
var jstransformer = require('jstransformer');
var path = require('path');
var merge = require('merge');

module.exports = function (opts) {
  var transformers = {};

  // Load all the required JSTransformers.
  for (var i in opts || {}) {
    var name = opts[i];
    transformers[name] = jstransformer(require('jstransformer-' + name));
  }

  return function (files, metalsmith, done) {
    for (var transform in transformers) {

      // Find all files that match the given transformer.
      var transformFiles = minimatch.match(Object.keys(files), "*." + transform);
      for (var i in transformFiles) {
        var filename = transformFiles[i];
        var data = files[filename];
        var locals = merge(data, metalsmith.metadata());

        // Construct the new file name.
        var name = path.basename(filename, path.extname(filename));

        // Default to an .html file extension if none exists.
        if (path.extname(name) === '') {
          name = path.basename(filename, path.extname(filename)) + '.html';
        }

        // Process the file contents using the transformer.
        var result = transformers[transform].render(data.contents.toString('utf-8'), locals);
        data.contents = new Buffer(result.body);

        // Replace the file with the newly processed one.
        delete files[filename];
        files[name] = data;
      }
    }

    done();
  }
};
