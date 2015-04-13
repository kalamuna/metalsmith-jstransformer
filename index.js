var minimatch = require('minimatch');
var jstransformer = require('jstransformer');
var path = require('path');

function plugin (opts) {
  var transformers = {};

  var mix = function(obj1, obj2) {
    var newObj = {};
    var key;
    for (key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        newObj[key] = obj1[key];
      }
    }
    for (key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        newObj[key] = obj2[key];
      }
    }
    return newObj;
  };

  // Load all the required JSTransformers.
  for (var i in opts || {}) {
    var name = opts[i];
    transformers[name] = jstransformer(require('jstransformer-' + name));
  }

  return function (files, metalsmith, done) {
    for (var transform in transformers) {
      // Find all files that can be handled by the given transform.
      // TODO: Use .inputFormats().
      var process = Object.keys(files).filter(
        minimatch.filter('*.' + transform, {
          matchBase: true
        })
      );

      // Loop through each transformable file.
      for (var file in process) {
        var filename = process[file];
        var data = files[filename];
        var locals = mix(data, metalsmith.metadata());

        // Construct the new file name.
        var name = path.basename(filename, path.extname(filename));

        // Default to an .html file extension if none exists.
        if (path.extname(name) === '') {
          name = path.basename(filename, path.extname(filename)) + '.html';
        }

        // Process the file contents using the transformer.
        var result = transformers[transform].render(data.contents, locals);
        data.contents = new Buffer(result.body);

        // Replace the file with the newly processed one.
        delete files[filename];
        files[name] = data;
      }
    }

    done();
  }
}

module.exports = plugin;
