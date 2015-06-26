var assertDir = require('assert-dir-equal')
var jstransformer = require('../')
var Metalsmith = require('metalsmith')

function test (name, options) {
  /* globals it describe */
  it(name, function (done) {
    Metalsmith('test/fixtures/' + name)
      .use(jstransformer(options || {}))
      .build(function (err) {
        if (err) {
          return done(err)
        }
        assertDir('test/fixtures/' + name + '/expected', 'test/fixtures/' + name + '/build')
        return done()
      })
  })
}

describe('metalsmith-jstransformer', function () {
  test('basic')
})
