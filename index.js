var path = require('path')
var jstransformer = require('jstransformer')
var toTransformer = require('inputformat-to-jstransformer')
var extend = require('extend')
var async = require('async')
var clone = require('clone')
var minimatch = require('minimatch')

var transformers = {}

/**
* Get the transformer from the given name.
*
* @return The JSTransformer; null if it doesn't exist.
*/
function getTransformer(name) {
  if (name in transformers) {
    return transformers[name]
  }
  var transformer = toTransformer(name)
  transformers[name] = transformer ? jstransformer(transformer) : false
  return transformers[name]
}

module.exports = function (opts) {
  // Prepare the options.
  opts = opts || {}
  opts.layoutPattern = opts.layoutPattern || 'layouts/**'
  opts.pattern = opts.pattern || '**'
  var defaultLayout = opts.defaultLayout

  // Execute the plugin.
  return function (files, metalsmith, done) {
    // Retrieve all layouts.
    var templates = {}
    var filesKeys = Object.keys(files)
    var layouts = minimatch.match(filesKeys, opts.layoutPattern, {matchBase: true})

    /**
     * Compile the given layout and store it in templates.
     */
    function compileLayout(layout, done) {
      // Find which JSTransformer to compile with.
      var transform = path.extname(layout).substring(1)
      transform = getTransformer(transform)
      if (transform) {
        // Retrieve the options for the JSTransformer.
        var thefilename = path.join(metalsmith._directory, metalsmith._source, layout)
        var options = extend({}, files[layout], {
          filename: thefilename,
          root: metalsmith.source()
        })

        // Compile the content.
        var content = files[layout].contents.toString()
        transform.compileAsync(content, options).then(function (results) {
          // Wire up the template for the layout.
          templates[layout] = results

          // Set the layout as the default layout, if desired.
          if (files[layout].defaultLayout) {
            defaultLayout = layout
          }

          // Finished compiling the layout into a template.
          done()
        }, function (err) {
          done(err)
        })
      } else {
        done('The layout ' + layout + ' has an unsupported transform of ' + transform + '.')
      }
    }

    /**
     * Delete the given file from the files array.
     */
    function deleteFile(file, done) {
      if (file in files) {
        delete files[file]
      }
      done()
    }

    /**
     * Render the given file in its layout templates.
     */
    function renderContent(file, done) {
      // Only render content, skip rendering layouts.
      if (!(file in layouts)) {
        var layoutName = files[file].layout || defaultLayout
        while (layoutName && templates[layoutName]) {
          // Build the options/locals.
          var thefilename = path.join(metalsmith._directory, metalsmith._source, layoutName)
          var locals = extend({}, metalsmith.metadata(), files[layoutName], files[file], {
            contents: files[file].contents.toString(),
            filename: thefilename,
            root: metalsmith.source()
          })

          // Render the content using the template function and options.
          var output = templates[layoutName].fn(locals)
          files[file].contents = output

          // Allow for recursive explicit layouts.
          layoutName = files[layoutName].layout
        }
      }
      done()
    }

    /**
     * Process the given file. Call done() when done processing.
     */
    function processFile(file, done) {
      /**
       * Process the given extension on the file.
       */
      function processExtension(extension, done) {
        // Retrieve the transformer.
        var transformer = getTransformer(extension)

        // Process the extension until the transformation is done.
        if (transformer && !files[file].jstransformerDone) {
          // Construct the options.
          var options = extend({}, metalsmith.metadata(), files[file], {
            filename: metalsmith.source() + '/' + file,
            root: metalsmith.source()
          })

          // Get the transformer to render the contents.
          transformer.renderAsync(files[file].contents.toString(), options, options).then(function (result) {
            // Allow providing the default output format.
            files[file].jstransformerOutputFormat = transformer.outputFormat
            // Remove an extension from the end.
            files[file].jstransformerFilePath.pop()
            files[file].contents = new Buffer(result.body)
            done()
          }, function (err) {
            files[file].jstransformerDone = true
            done(err)
          })
        } else {
          // The transformer isn't supported, skip the rest.
          files[file].jstransformerDone = true
          done()
        }
      }

      // Prepare the extension processing.
      var extensions = file.split('.')
      files[file].jstransformerFilePath = clone(extensions)
      extensions.reverse().pop()
      // Loop through the transformer series.
      async.mapSeries(extensions, processExtension, done)
    }

    /**
     * Rename the given file to its desired new name.
     */
    function renameFile(file, done) {
      var filename = file
      // Check if there is a potential filepath change.
      if (files[file].jstransformerFilePath) {
        // See if we should add the default output format.
        if (files[file].jstransformerFilePath.length === 1 && files[file].jstransformerOutputFormat) {
          files[file].jstransformerFilePath.push(files[file].jstransformerOutputFormat)
        }
        filename = files[file].jstransformerFilePath.join('.')
      }

      // See if we are to now rename the file.
      if (filename !== file) {
        var newFile = clone(files[file])
        delete files[file]
        files[filename] = newFile
      }

      done()
    }

    // TODO: Clean up async function chain tree.
    // Compile all layouts.
    async.map(layouts, compileLayout, function (err) {
      if (err) {
        done(err)
      } else {
        // Render all individual content.
        var contentFiles = minimatch.match(filesKeys, opts.pattern, {matchBase: true})
        async.map(contentFiles, processFile, function (err) {
          if (err) {
            done(err)
          } else {
            // Render the content within the layouts.
            async.map(contentFiles, renderContent, function (err) {
              if (err) {
                done(err)
              } else {
                // Delete the layout data.
                async.map(layouts, deleteFile, function (err) {
                  if (err) {
                    done(err)
                  } else {
                    // Now rename all the files.
                    async.map(Object.keys(files), renameFile, done)
                  }
                })
              }
            })
          }
        })
      }
    })
  }
}
