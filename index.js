const path = require('path')
const jstransformer = require('jstransformer')
const toTransformer = require('inputformat-to-jstransformer')
const extend = require('extend')
const async = require('async')
const clone = require('clone')
const minimatch = require('minimatch')

const transformers = {}

/**
* Get the transformer from the given name.
*
* @return The JSTransformer; null if it doesn't exist.
*/
function getTransformer(name) {
  if (name in transformers) {
    return transformers[name]
  }
  const transformer = toTransformer(name)
  transformers[name] = transformer ? jstransformer(transformer) : false
  return transformers[name]
}

module.exports = function (opts) {
  // Prepare the options.
  opts = opts || {}
  opts.layoutPattern = opts.layoutPattern || 'layouts/**'
  opts.pattern = opts.pattern || '**'
  opts.engineLocals = opts.engineLocals || {}
  opts.engineOptions = opts.engineOptions || {}
  let defaultLayout = opts.defaultLayout

  // Execute the plugin.
  return function (files, metalsmith, done) {
    // Retrieve all layouts.
    const templates = {}
    const filesKeys = Object.keys(files)
    const layouts = minimatch.match(filesKeys, opts.layoutPattern, {matchBase: true})

    /**
     * Compile the given layout and store it in templates.
     */
    function compileLayout(layout, done) {
      // Find which JSTransformer to compile with.
      let transform = path.extname(layout).substring(1)
      transform = getTransformer(transform)
      if (transform) {
        // Retrieve the options for the JSTransformer.
        const thefilename = path.join(metalsmith._directory, metalsmith._source, layout)
        const options = extend({}, opts.engineOptions[transform.name], files[layout], {
          filename: thefilename,
          root: metalsmith.source()
        })

        // Compile the content.
        const content = files[layout].contents.toString()
        transform.compileAsync(content, options).then(results => {
          // Wire up the template for the layout.
          templates[layout] = results
          templates[layout].transformName = transform.name

          // Set the layout as the default layout, if desired.
          if (files[layout].defaultLayout) {
            defaultLayout = layout
          }

          // Finished compiling the layout into a template.
          done()
        }, err => {
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
        let layoutName = files[file].layout || defaultLayout
        while (layoutName && templates[layoutName]) {
          // Build the options/locals.
          const thefilename = path.join(metalsmith._directory, metalsmith._source, layoutName)
          const transformName = templates[layoutName].transformName
          const locals = extend({}, metalsmith.metadata(), opts.engineLocals[transformName], files[layoutName], files[file], {
            contents: files[file].contents.toString(),
            filename: thefilename,
            root: metalsmith.source()
          })

          // Render the content using the template function and options.
          try {
            files[file].contents = templates[layoutName].fn(locals)
          } catch (err) {
            return done(err)
          }

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
        const transformer = getTransformer(extension)

        // Process the extension until the transformation is done.
        if (transformer && !files[file].jstransformerDone) {
          // Construct the options.
          const engineOpts = opts.engineOptions[transformer.name]
          const options = extend({}, metalsmith.metadata(), engineOpts, files[file], {
            filename: metalsmith.source() + '/' + file,
            root: metalsmith.source()
          })
          // Construct the locals.
          const engineLocals = opts.engineLocals[transformer.name]
          const locals = extend({}, metalsmith.metadata(), engineLocals, files[file], {
            filename: metalsmith.source() + '/' + file,
            root: metalsmith.source()
          })

          // Get the transformer to render the contents.
          transformer.renderAsync(files[file].contents.toString(), options, locals).then(result => {
            // Allow providing the default output format.
            files[file].jstransformerOutputFormat = transformer.outputFormat
            // Remove an extension from the end.
            files[file].jstransformerFilePath.pop()
            files[file].contents = Buffer.from(result.body)
            done()
          }, err => {
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
      const extensions = file.split('.')
      files[file].jstransformerFilePath = clone(extensions)
      extensions.reverse().pop()
      // Loop through the transformer series.
      async.mapSeries(extensions, processExtension, done)
    }

    /**
     * Rename the given file to its desired new name.
     */
    function renameFile(file, done) {
      let filename = file
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
        files[filename] = files[file]
        delete files[file]
      }

      done()
    }

    /**
     * Delete auxiliary metadata from the given file if exist.
     */
    function deleteAuxiliaryMetadata(file, done) {
      delete files[file].jstransformerOutputFormat
      delete files[file].jstransformerFilePath
      delete files[file].jstransformerDone
      done()
    }

    // TODO: Clean up async function chain tree.
    // Compile all layouts.
    async.map(layouts, compileLayout, err => {
      if (err) {
        done(err)
      } else {
        // Render all individual content.
        let contentFiles = []

        try {
          contentFiles = minimatch.match(filesKeys, opts.pattern, {matchBase: true})
        } catch (err) {
          return done(err)
        }

        async.map(contentFiles, processFile, err => {
          if (err) {
            done(err)
          } else {
            // Render the content within the layouts.
            async.map(contentFiles, renderContent, err => {
              if (err) {
                done(err)
              } else {
                // Delete the layout data.
                async.map(layouts, deleteFile, err => {
                  if (err) {
                    done(err)
                  } else {
                    // Now rename all the files.
                    async.map(Object.keys(files), renameFile, err => {
                      if (err) {
                        done(err)
                      } else {
                        // Now delete auxiliary metadata from files.
                        async.map(Object.keys(files), deleteAuxiliaryMetadata, done)
                      }
                    })
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
