var assertDir = require('assert-dir-equal')
var jstransformer = require('../')
var Metalsmith = require('metalsmith')

describe('metalsmith-jstransformer', function () {
  it('should process the plugins correctly', function (done) {
    Metalsmith('test/fixtures/basic')
      .use(jstransformer([
        'jade',
        'styl'
      ]))
      .build(function(err) {
        if (err) return done(err)
        assertDir('test/fixtures/basic/expected', 'test/fixtures/basic/build')
        return done(null)
      })
  })
})