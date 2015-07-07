var jstransformer = require('jstransformer')
var listOfJsTransformers = require('list-of-jstransformers')
var transformers = {}
var path = require('path')
var extend = require('extend')

/**
 * Get the transformer from the given name.
 *
 * @return The JSTransformer; null if it doesn't exist.
 */
function getTransformer (name) {
  if (listOfJsTransformers.indexOf(name) >= 0) {
    if (transformers[name]) {
      return transformers[name]
    }

    var transform = null
    try {
      transform = jstransformer(require('jstransformer-' + name))
    } catch (e) {
      // Do nothing.
    }
    transformers[name] = transform
    return transformers[name]
  }
}

module.exports = function (opts) {
  return function (files, metalsmith, done) {
    // Loop through every file.
    for (var file in files) {
      // Ignore all partials.
      if (path.basename(file).charAt(0) !== '_') {
        // Get all the transforming extensions.
        var extensions = file.split('.')
        for (var i = extensions.length - 1; i > 0; i--) {
          // Retrieve the transformer.
          var transformer = getTransformer(extensions[i])
          if (transformer) {
            // Process the content of the file with the transformer.
            var input = files[file].contents.toString()

            // Construct the options.
            var options = extend({}, metalsmith.metadata(), files[file], {
              filename: metalsmith.source() + '/' + file
            })

            // TODO: Figure out what to do for options.
            var output = transformer.render(input, options, options)
            files[file].contents = new Buffer(output.body)

            // Rename the file, removing the extension.
            var data = files[file]
            delete files[file]
            var filepath = extensions
            filepath.pop()
            file = filepath.join('.')
            files[file] = data
          } else {
            // Skip the rest of the file transformations.
            break
          }
        }
      }
    }

    done()
  }
}
