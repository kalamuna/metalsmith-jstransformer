var jstransformer = require('jstransformer')
var transformers = {}

/**
 * Get the transformer from the given name.
 */
function getTransformer (name) {
  if (transformers[name]) {
    return transformers[name]
  }
  transformers[name] = jstransformer(require('jstransformer-' + name))
  return transformers[name]
}

module.exports = function (opts) {
  return function (files, metalsmith, done) {
    // Loop through every file.
    for (var file in files) {
      // Get all the transforming extensions.
      var extensions = file.split('.')
      // Only process if there are more than 2 extensions.
      if (extensions.length > 2) {
        var transforms = extensions.splice(2)
        // Loop through backwards through each extension.
        for (var i = transforms.length - 1; i >= 0; i--) {
          // Retrieve the transform name.
          var transformName = transforms[i]
          var transformer = getTransformer(transformName)

          // Process the content of the file with the transformer.
          var input = files[file].contents.toString()
          // TODO: Figure out what to do for options.
          var output = transformer.render(input, files[file], files[file])
          files[file].contents = new Buffer(output.body)
        }

        // Now that content is updated, rename without the extensions.
        var data = files[file]
        delete files[file]
        var finalPath = extensions[0] + '.' + extensions[1]
        files[finalPath] = data
      }
    }

    done()
  }
}
