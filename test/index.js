var assertDir = require('assert-dir-equal')
var Metalsmith = require('metalsmith')
var testit = require('testit')
var rmdir = require('rimraf')

/**
 * Define a test case.
 *
 * @param name - The folder name for the test fixtures.
 * @param plugins - An associative array of plugin key name, and options for it.
 */
function test(name, plugins) {
  testit(name, function (done) {
    // Ensure we load the Metalsmith JSTransformer Layouts plugin.
    plugins = plugins || {}
    if (!plugins['..']) {
      plugins['..'] = {}
    }

    // Construct Metalsmith with a clean build directory.
    var testPath = 'test/fixtures/' + name
    rmdir.sync(testPath + '/build')
    var metalsmith = new Metalsmith(testPath)
    for (var plugin in plugins || {}) {
      if (plugins.hasOwnProperty(plugin)) {
        metalsmith.use(require(plugin)(plugins[plugin]))
      }
    }
    metalsmith.build(function (err) {
      if (err) {
        done(err)
      }
      assertDir(testPath + '/build', testPath + '/expected')
      done()
    })
  })
}

testit('metalsmith-jstransformer', function () {
  test('basic')
  test('convention-defaultLayout')
  test('include')
  test('inherited')
  test('jstransformer')
  test('layouts')
  test('multiple')
  test('sample')
  test('option-pattern', {
    '..': {
      layoutPattern: '_*'
    }
  })
  test('option-default', {
    '..': {
      defaultLayout: 'layouts/_default.jade'
    }
  })
})
