/* eslint valid-jsdoc: 0 */
const assertDir = require('assert-dir-equal')
const Metalsmith = require('metalsmith')
const testit = require('testit')
const rmdir = require('rimraf')

/**
 * Define a test case.
 *
 * @param name - The folder name for the test fixtures.
 * @param plugins - An associative array of plugin key name, and options for it.
 */
function test(name, plugins) {
  testit(name, done => {
    // Ensure we load the Metalsmith JSTransformer Layouts plugin.
    plugins = plugins || {}
    if (!plugins['..']) {
      plugins['..'] = {}
    }

    // Construct Metalsmith with a clean build directory.
    const testPath = 'test/fixtures/' + name
    rmdir.sync(testPath + '/build')

    // Boot up Metalsmith and load the plugins.
    const metalsmith = new Metalsmith(testPath)
    Object.keys(plugins).forEach(pluginName => {
      metalsmith.use(require(pluginName)(plugins[pluginName]))
    })

    // Build with Metalsmith.
    metalsmith.build(err => {
      if (err) {
        return done(err)
      }

      assertDir(testPath + '/build', testPath + '/expected')
      done()
    })
  })
}

testit('metalsmith-jstransformer', () => {
  test('basic')
  test('convention-defaultLayout')
  test('include')
  test('include-twig', {
    'metalsmith-paths': {}
  })
  test('inherited')
  test('jstransformer')
  test('layouts')
  test('subfolder')
  test('multiple')
  test('sample')
  test('option-pattern', {
    '..': {
      layoutPattern: '_*'
    }
  })
  test('option-default', {
    '..': {
      defaultLayout: 'layouts/_default.pug'
    }
  })
  test('content-pattern', {
    '..': {
      pattern: '*ood*'
    }
  })
  test('engine-options', {
    '..': {
      engineOptions: {
        pug: {
          pretty: true
        },
        twig: {
          namespaces: {
            comps: 'test/fixtures/engine-options/src/components'
          }
        }
      },
      engineLocals: {
        pug: {
          pageTitle: 'Goodbye World!'
        },
        twig: {
          pageTitle: 'Twig Title!'
        }
      }
    }
  })
})
