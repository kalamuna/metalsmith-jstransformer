var jstransformer = require('jstransformer')
var toTransformer = require('inputformat-to-jstransformer')
var transformers = {}
var path = require('path')
var extend = require('extend')

/**
 * Get the transformer from the given name.
 *
 * @return The JSTransformer; null if it doesn't exist.
 */
function getTransformer (name) {
  if (transformers[name]) {
    return transformers[name]
  }
  var transformer = toTransformer(name)
  if (transformer) {
    transformer = jstransformer(transformer)
  }
  transformers[name] = transformer
  return transformer
}

module.exports = function (opts) {
  return function (files, metalsmith, done) {
    // Loop through every file.
    for (var file in files) {
      // Do not process partials.
      if (path.basename(file).charAt(0) !== '_') {
        // Get all the transforming extensions.
        var extensions = file.split('.')
        // Prepare what the default output format should be.
        var outputFormat = ''
        // Loop through all the extensions in reverse order.
        for (var i = extensions.length - 1; i > 0; i--) {
          // Retrieve the transformer.
          var transformer = getTransformer(extensions[i])
          if (transformer) {
            // Process the content of the file with the transformer.
            var input = files[file].contents.toString()

            // Construct the options.
            // TODO: Figure out what other options to inject.
            var options = extend({}, metalsmith.metadata(), files[file], {
              filename: metalsmith.source() + '/' + file
            })

            var output = transformer.render(input, options, options)
            files[file].contents = new Buffer(output.body)

            // Rename the file, removing the extension.
            var data = files[file]
            delete files[file]
            var filepath = extensions
            filepath.pop()
            file = filepath.join('.')
            files[file] = data

            // Retrieve the new output format for the given transformer.
            outputFormat = transformer.outputFormat
          } else {
            // Skip the rest of the file transformations.
            break
          }
        }
        // Rename the file to the output format, if no extension was provided.
        if (path.extname(file) === '' && outputFormat !== '') {
          var newFile = files[file]
          delete files[file]
          files[file + '.' + outputFormat] = newFile
        }
      }
    }

    done()
  }
}
